import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
})

// 資料庫連接池
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'stylemate_fashion',
  user: 'postgres',
  password: '2616',
  max: 10,
  idleTimeoutMillis: 30000,
})

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()

    // 使用 RAG 搜尋相關知識
    let ragContext = ''
    try {
      const ragResponse = await fetch('http://localhost:3004/api/rag/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
          limit: 3
        }),
      })
      
      const ragResult = await ragResponse.json()
      
      if (ragResult.success && ragResult.results.length > 0) {
        ragContext = `\n\n**相關知識庫資訊：**\n${ragResult.results.map(r => 
          `來源：${r.source}\n內容：${r.content}\n相似度：${r.similarity.toFixed(2)}`
        ).join('\n\n')}\n\n`
      }
    } catch (ragError) {
      console.log('RAG 搜尋略過:', ragError)
    }

    // 從資料庫取得韓國服裝資訊
    const client = await pool.connect()
    
    // 根據用戶輸入判斷需求類型
    const userMessage = message.toLowerCase()
    let searchConditions = []
    let params = []
    let paramCount = 0
    
    // 簡單的關鍵字匹配來篩選商品
    if (userMessage.includes('洋裝') || userMessage.includes('連身裙') || userMessage.includes('裙子')) {
      paramCount++
      searchConditions.push(`category_zh = $${paramCount}`)
      params.push('洋裝')
    }
    
    if (userMessage.includes('上衣') || userMessage.includes('shirt') || userMessage.includes('t恤')) {
      paramCount++
      searchConditions.push(`category_zh = $${paramCount}`)
      params.push('上衣')
    }
    
    if (userMessage.includes('優雅') || userMessage.includes('正式') || userMessage.includes('上班')) {
      paramCount++
      searchConditions.push(`style_tags_zh::text LIKE $${paramCount}`)
      params.push('%優雅%')
    }
    
    if (userMessage.includes('韓系') || userMessage.includes('韓國') || userMessage.includes('korean')) {
      paramCount++
      searchConditions.push(`style_tags_zh::text LIKE $${paramCount}`)
      params.push('%韓系%')
    }
    
    if (userMessage.includes('休閒') || userMessage.includes('日常')) {
      paramCount++
      searchConditions.push(`occasion_zh::text LIKE $${paramCount}`)
      params.push('%日常%')
    }
    
    if (userMessage.includes('約會') || userMessage.includes('date')) {
      paramCount++
      searchConditions.push(`occasion_zh::text LIKE $${paramCount}`)
      params.push('%約會%')
    }

    // 構建查詢
    let query = `
      SELECT 
        id, name_zh, name_en, category_zh, category_en,
        colors_zh, colors_en, style_tags_zh, style_tags_en,
        occasion_zh, occasion_en, price_twd, description_zh, description_en
      FROM fashion_items 
    `
    
    if (searchConditions.length > 0) {
      query += ` WHERE (${searchConditions.join(' OR ')}) `
    }
    
    query += ` ORDER BY created_at DESC LIMIT 10`
    
    const result = await client.query(query, params)
    client.release()

    // 如果沒有找到篩選結果，就取所有商品
    let fashionItems = result.rows
    if (fashionItems.length === 0) {
      const allItemsQuery = `
        SELECT 
          id, name_zh, name_en, category_zh, category_en,
          colors_zh, colors_en, style_tags_zh, style_tags_en,
          occasion_zh, occasion_en, price_twd, description_zh, description_en
        FROM fashion_items 
        ORDER BY created_at DESC LIMIT 6
      `
      const allResult = await pool.query(allItemsQuery)
      fashionItems = allResult.rows
    }

    // 構建商品信息給 AI
    const productInfo = fashionItems.map(item => ({
      id: item.id,
      name: item.name_zh || item.name_en,
      price: item.price_twd,
      category: item.category_zh || item.category_en,
      colors: item.colors_zh || item.colors_en || [],
      styleTags: item.style_tags_zh || item.style_tags_en || [],
      occasion: item.occasion_zh || item.occasion_en || [],
      description: item.description_zh || item.description_en
    }))

    const systemPrompt = `你是 STYLEMATE 的專業韓式時尚顧問助理。根據用戶的需求，從以下商品中推薦最適合的產品：

商品清單：
${JSON.stringify(productInfo, null, 2)}

${ragContext ? `額外知識庫資訊：${ragContext}` : ''}

請根據用戶的輸入：
1. 理解用戶的風格偏好、場合需求、預算等
2. 參考知識庫資訊（如果有的話）提供更專業的建議
3. 從商品清單中選擇 2-3 個最適合的商品
4. 用溫暖、專業的語調推薦
5. 說明推薦理由
6. 用繁體中文回答

回答格式要包含推薦的商品 ID，這樣可以後續顯示商品。

範例回答格式：
根據您的需求，我為您推薦以下商品：

**推薦商品：**
- [dress1] 韓式優雅連身裙 - 適合約會場合，展現優雅氣質
- [top1] 韓系休閒上衣 - 百搭舒適，日常穿搭首選

**推薦理由：**
...詳細說明...

如果有知識庫資訊，請適當引用並說明。請用親切、專業的語調回答。`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        ...conversationHistory.map((msg: any) => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const aiResponse = completion.choices[0]?.message?.content || "抱歉，我現在無法回應，請稍後再試。"

    // 解析推薦的商品 ID
    const recommendedProductIds = []
    const idMatches = aiResponse.match(/\[([^\]]+)\]/g)
    if (idMatches) {
      for (const match of idMatches) {
        const id = match.replace(/[\[\]]/g, '')
        if (fashionItems.find(item => item.id.toString() === id)) {
          recommendedProductIds.push(id)
        }
      }
    }
    
    // 如果沒有找到推薦的 ID，就返回前3個商品的ID
    if (recommendedProductIds.length === 0 && fashionItems.length > 0) {
      recommendedProductIds.push(...fashionItems.slice(0, 3).map(item => item.id.toString()))
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
      recommendedProducts: recommendedProductIds
    })

  } catch (error) {
    console.error('聊天推薦錯誤:', error)
    return NextResponse.json(
      { 
        success: false, 
        response: "抱歉，我現在遇到一些技術問題，請稍後再試。",
        recommendedProducts: []
      },
      { status: 500 }
    )
  }
}