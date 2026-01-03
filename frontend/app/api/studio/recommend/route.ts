import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

/**
 * BE 27 Studio 專屬推薦 API
 * 使用 Django API 搜尋商品（帶去背圖）
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
})

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1'

// Django 商品結構
interface DjangoProduct {
  id: number
  name: string
  price: string
  category: string
  style: string
  image: string
  image_nobg: string
  tags: string[]
  colors: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { success: false, error: '請輸入搜尋內容' },
        { status: 400 }
      )
    }

    console.log('🎨 Studio 推薦請求:', message)

    // Step 1: 使用 GPT 從 prompt 提取搜尋關鍵字
    // 🎯 將生活場景語言轉換為資料庫中的服裝標籤
    const keywordExtraction = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `你是時尚穿搭關鍵字轉換專家。將用戶的生活場景需求轉換為服裝標籤。

📋 可用標籤庫：
【場合】約會、派對、聚會、職場、日常、度假、花園派對
【風格】優雅、甜美、性感、韓系、法式、極簡、浪漫、復古、清新、現代、簡約、俐落、精緻、飄逸、都會、年輕、休閒
【顏色】粉色、白色、黑色、米色、灰色、薄荷綠、淺綠色、裸色
【特徵】套裝、荷葉邊、蕾絲、開叉、露肩、露腰、細肩帶、V領、一字肩、抹胸、收腰、修身、針織、牛仔
【季節】春季

🔄 生活場景 → 服裝標籤轉換：
• 旅行/出遊/度假/出國 → 度假,休閒,日常
• 出差/商務/面試 → 職場,優雅,俐落
• 上班/通勤/辦公室 → 職場,簡約,都會
• 約會/見男友/浪漫晚餐 → 約會,甜美,浪漫
• 婚禮/宴會/晚宴 → 派對,優雅,精緻
• 逛街/週末/休閒日 → 日常,休閒,簡約
• 聚餐/朋友聚會 → 聚會,韓系,年輕
• 夏天/熱/清涼 → 露肩,細肩帶,清新
• 春天/春遊 → 春季,清新,浪漫
• 正式/重要場合 → 優雅,精緻,俐落

🌍 目的地天氣暗示：
• 日本春天 → 春季,清新,簡約
• 日本夏天 → 清新,日常,休閒
• 東南亞/海島 → 度假,清新,露肩
• 歐洲 → 法式,優雅,都會

⚠️ 規則：
1. 只輸出標籤，用逗號分隔
2. 選擇 2-3 個最相關的標籤
3. 必須使用上方標籤庫中的詞彙
4. 不要輸出其他文字

範例：
輸入：日本旅行5天穿搭
輸出：度假,日常,清新

輸入：明天要去面試
輸出：職場,優雅,俐落

輸入：週末約會穿什麼
輸出：約會,甜美

輸入：海邊度假
輸出：度假,清新,露肩`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.3,
      max_tokens: 50,
    })

    const keywords = keywordExtraction.choices[0]?.message?.content?.trim() || ''
    console.log('🔑 提取的關鍵字:', keywords)

    // Step 2: 調用 Django API 搜尋商品
    const searchUrl = `${DJANGO_API_URL}/products/ai_search/?q=${encodeURIComponent(keywords)}&limit=12`
    console.log('🔍 Django 搜尋 URL:', searchUrl)

    const djangoResponse = await fetch(searchUrl, {
      cache: 'no-store',
    })

    if (!djangoResponse.ok) {
      throw new Error(`Django API 錯誤: ${djangoResponse.status}`)
    }

    const searchResult = await djangoResponse.json()
    console.log(`✅ Django 找到 ${searchResult.count} 件商品`)

    // Step 3: 如果有商品，讓 AI 生成推薦說明
    let aiResponse = ''
    if (searchResult.results && searchResult.results.length > 0) {
      const productList = searchResult.results.map((p: DjangoProduct) =>
        `[${p.id}] ${p.name} - ${p.category} - $${p.price}`
      ).join('\n')

      const recommendation = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `你是 BE 27 時尚顧問。根據用戶需求和搜尋到的商品，簡短回覆推薦理由。

回覆格式（簡潔版）：
🎯 根據您的需求「XXX」，為您找到 N 件商品：

主要特色：
• 特色一
• 特色二

點擊商品即可加入白板搭配！`
          },
          {
            role: 'user',
            content: `用戶需求：${message}\n\n搜尋到的商品：\n${productList}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      })

      aiResponse = recommendation.choices[0]?.message?.content || ''
    } else {
      aiResponse = `🔍 根據「${message}」沒有找到完全匹配的商品，請嘗試其他關鍵字。`
    }

    return NextResponse.json({
      success: true,
      message: aiResponse,
      keywords: keywords.split(',').map(k => k.trim()),
      products: searchResult.results || [],
      count: searchResult.count || 0,
    })

  } catch (error: any) {
    console.error('❌ Studio 推薦錯誤:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || '推薦服務暫時不可用',
        products: []
      },
      { status: 500 }
    )
  }
}
