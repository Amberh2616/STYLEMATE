import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import OpenAI from 'openai'
import { analyzeIntent } from '@/lib/core/intentParser'
import { TravelWeatherAnalyzer } from '@/lib/travelWeatherAnalyzer'

// 回到可靠的 OpenAI 方案
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
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

// 簡單的請求頻率限制（防止API濫用）
const requestCounts = new Map()
const RATE_LIMIT = 20 // 每分鐘最多20次請求
const RATE_WINDOW = 60000 // 1分鐘

export async function POST(request: NextRequest) {
  try {
    // 基本請求頻率限制
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const userRequests = requestCounts.get(clientIP) || []
    const recentRequests = userRequests.filter((time: number) => now - time < RATE_WINDOW)
    
    if (recentRequests.length >= RATE_LIMIT) {
      return NextResponse.json(
        { success: false, response: "請求過於頻繁，請稍後再試。" },
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      )
    }
    
    recentRequests.push(now)
    requestCounts.set(clientIP, recentRequests)
    
    // 確保正確解析 UTF-8 編碼的 JSON
    const body = await request.text()
    let parsedBody
    try {
      parsedBody = JSON.parse(body)
    } catch (error) {
      console.error('❌ JSON 解析失敗:', error)
      return NextResponse.json(
        { success: false, response: "請求格式錯誤" },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      )
    }
    
    const { message, conversationHistory, image, analysis_type = 'auto', userEmail } = parsedBody

    console.log('🎯 Chat 推薦請求:', { 
      message: message, 
      messageLength: message?.length,
      messageBytes: Buffer.from(message || '', 'utf8').length,
      historyLength: conversationHistory?.length || 0,
      hasImage: !!image,
      analysis_type,
      userEmail
    })

    // 🧑‍💼 嘗試讀取用戶問卷資料作為輔助參考
    let memberPreferences = null
    if (userEmail) {
      try {
        // 直接從內部模擬資料庫讀取（避免網路請求）
        const preferencesDatabase = global.preferencesDatabase || {}
        const preferences = preferencesDatabase[userEmail]
        
        if (preferences?.analysisResults) {
          memberPreferences = preferences.analysisResults
          console.log('📋 找到用戶問卷資料:', memberPreferences?.styleProfile)
        } else {
          console.log('📋 未找到用戶問卷資料，將以純文字分析')
        }
      } catch (prefError) {
        console.log('📋 問卷資料查詢失敗，將以純文字分析:', prefError.message)
      }
    }

    // 🖼️ 如果有圖片，使用 GPT-4V 進行圖片分析
    if (image) {
      return await handleImageAnalysis(image, message, analysis_type, memberPreferences)
    }

    // 🧠 使用 Intent Parser 進行智能分析
    const intentAnalysis = analyzeIntent({ text: message })
    console.log('🧠 Intent 分析結果:', intentAnalysis)
    console.log('🔍 Debug - Mode:', intentAnalysis.mode)
    console.log('🔍 Debug - Needs Weather:', intentAnalysis.needs_weather)
    console.log('🔍 Debug - Destinations:', intentAnalysis.destinations)
    
    let trendContext = ''
    let weatherContext = ''
    
    // 根據 Intent 決定是否搜尋趨勢資訊
    if (intentAnalysis.mode === 'trend_summary') {
      console.log('🔥 檢測到流行趨勢查詢，啟動WebSearch...')
      try {
        trendContext = await fetchFashionTrends(message)
      } catch (trendError) {
        console.log('⚠️ WebSearch 失敗，使用備用趨勢資訊:', trendError.message)
        trendContext = getFallbackTrendInfo(message)
      }
    }
    
    // 根據 Intent 決定是否查詢天氣 - 強制測試
    console.log('🔍 天氣檢查條件:')
    console.log('  - needs_weather:', intentAnalysis.needs_weather)
    console.log('  - destinations:', intentAnalysis.destinations)
    console.log('  - 條件滿足:', intentAnalysis.needs_weather && intentAnalysis.destinations)
    
    // 強制為旅行查詢添加真實天氣預報
    if ((intentAnalysis.needs_weather && intentAnalysis.destinations) || 
        (intentAnalysis.mode === 'travel_plan' || message.includes('旅行') || message.includes('出差'))) {
      console.log('🌤️ 檢測到天氣需求，啟動智能天氣分析...')
      try {
        // 使用 TravelWeatherAnalyzer 進行智能分析
        const travelContext = TravelWeatherAnalyzer.analyzeUserInput(message)
        console.log('🧠 旅遊語境分析:', travelContext)
        
        if (travelContext.cityQuery && travelContext.needsWeather) {
          const apiKey = process.env.OPENWEATHER_API_KEY
          if (apiKey) {
            console.log('🌐 調用5天天氣預報 API...')
            const forecasts = await TravelWeatherAnalyzer.fetch5DayForecast(travelContext.cityQuery, apiKey)
            
            if (forecasts.length > 0) {
              console.log('✅ 獲取5天天氣預報成功，天數:', forecasts.length)
              const planResult = TravelWeatherAnalyzer.generate5DayOutfitPlan(forecasts, travelContext)
              weatherContext = planResult.content
              // 將天氣推薦的產品加入推薦清單
              if (planResult.recommendedProducts && planResult.recommendedProducts.length > 0) {
                console.log('🔍 天氣推薦商品 ID:', planResult.recommendedProducts)
                // 這些 ID 會在後面與 AI 推薦的 ID 合併
              }
              console.log('🔍 5天穿搭計劃生成，長度:', weatherContext.length)
            } else {
              throw new Error('天氣預報數據為空')
            }
          } else {
            throw new Error('OpenWeather API Key 未設定')
          }
        } else {
          // 沒有明確地點的通用旅行建議
          const destinations = intentAnalysis.destinations ? intentAnalysis.destinations.join('、') : travelContext.location || '目的地'
          const duration = intentAnalysis.date_range ? `${intentAnalysis.date_range.end.replace('+', '')}` : '多天'
          weatherContext = `\n\n**🌤️ 旅行穿搭建議：**
目的地：${destinations}
行程：${duration}

**建議穿搭策略：**
• **多層次搭配**：準備可拆卸外套，應對溫差變化
• **舒適優先**：選擇透氣材質，長時間穿著不疲累  
• **場合彈性**：商務正式+休閒觀光兩用單品
• **行李精簡**：選擇好搭配、多用途的基本款\n`
        }
        
        console.log('✅ 天氣分析完成，長度:', weatherContext.length)
        console.log('🔍 天氣內容預覽:', weatherContext.substring(0, 150) + '...')
      } catch (weatherError) {
        console.log('⚠️ 天氣分析失敗，使用備用建議:', weatherError.message)
        // 備用通用建議
        const destinations = intentAnalysis.destinations ? intentAnalysis.destinations.join('、') : '目的地'
        const duration = intentAnalysis.date_range ? `${intentAnalysis.date_range.end.replace('+', '')}` : '多天'
        weatherContext = `\n\n**🌤️ 旅行穿搭建議：**
目的地：${destinations}
行程：${duration}

**建議穿搭策略：**
• **多層次搭配**：準備可拆卸外套，應對溫差變化
• **舒適優先**：選擇透氣材質，長時間穿著不疲累  
• **場合彈性**：商務正式+休閒觀光兩用單品
• **行李精簡**：選擇好搭配、多用途的基本款\n`
      }
    }

    // 🤖 1. 優先使用 Fashion-CLIP 語義搜尋
    let fashionClipResults = []
    let fashionClipContext = ''
    
    try {
      console.log('🔍 嘗試 Fashion-CLIP 語義搜尋...')
      const fashionClipResponse = await fetch('http://localhost:3003/api/fashion-clip/demo-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
          type: 'text',
          limit: 8,
          minSimilarity: 0.3
        }),
      })
      
      const fashionClipResult = await fashionClipResponse.json()
      
      if (fashionClipResult.success && fashionClipResult.results.length > 0) {
        fashionClipResults = fashionClipResult.results
        fashionClipContext = `\n\n**🤖 Fashion-CLIP AI 語義分析結果：**\n` +
          `找到 ${fashionClipResults.length} 個高度相關的商品\n` +
          fashionClipResults.slice(0, 3).map(item => 
            `• ${item.name_zh || item.name_en} (相似度: ${(item.similarity * 100).toFixed(0)}%)\n` +
            `  風格: ${Array.isArray(item.style_tags_zh) ? item.style_tags_zh.join('、') : item.style_tags_zh || '未知'}\n` +
            `  適合場合: ${Array.isArray(item.occasion_zh) ? item.occasion_zh.join('、') : item.occasion_zh || '未知'}`
          ).join('\n\n') + '\n\n'
        
        console.log(`✅ Fashion-CLIP 找到 ${fashionClipResults.length} 個相關商品`)
      }
    } catch (fashionClipError) {
      console.log('⚠️ Fashion-CLIP 搜尋失敗，使用備用方案:', fashionClipError.message)
    }

    // 📚 2. 使用 RAG 搜尋相關知識（補充資訊）
    let ragContext = ''
    try {
      const ragResponse = await fetch('http://localhost:3003/api/rag/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
          limit: 2
        }),
      })
      
      const ragResult = await ragResponse.json()
      
      if (ragResult.success && ragResult.results.length > 0) {
        ragContext = `\n\n**📚 相關知識庫資訊：**\n${ragResult.results.map(r => 
          `來源：${r.source}\n內容：${r.content}\n相似度：${r.similarity.toFixed(2)}`
        ).join('\n\n')}\n\n`
      }
    } catch (ragError) {
      console.log('RAG 搜尋略過:', ragError)
    }

    // 🎯 3. 優先使用 Fashion-CLIP 結果，備用資料庫查詢
    let fashionItems = []
    
    if (fashionClipResults.length > 0) {
      // 使用 Fashion-CLIP 結果
      console.log('✅ 使用 Fashion-CLIP 語義搜尋結果')
      fashionItems = fashionClipResults
    } else {
      // 備用方案：傳統資料庫查詢
      console.log('🔄 使用傳統資料庫查詢作為備用方案')
      
      const client = await pool.connect()
      
      // 根據用戶輸入判斷需求類型
      const userMessage = (message || '').toLowerCase()
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
      
      // 旅行/出差查詢 - 推薦通勤和休閒混搭
      if (userMessage.includes('旅行') || userMessage.includes('旅遊') || userMessage.includes('出差') || userMessage.includes('出國')) {
        paramCount++
        searchConditions.push(`(occasion_zh::text LIKE $${paramCount} OR occasion_zh::text LIKE $${paramCount + 1})`)
        params.push('%通勤%')
        paramCount++
        params.push('%日常%')
      }

      // 構建查詢
      let query = `
        SELECT 
          id, image_path, filename, name_zh, name_en, category_zh, category_en,
          colors_zh, colors_en, style_tags_zh, style_tags_en,
          occasion_zh, occasion_en, price_twd, description_zh, description_en
        FROM fashion_items 
      `
      
      if (searchConditions.length > 0) {
        query += ` WHERE (${searchConditions.join(' OR ')}) `
      }
      
      query += ` ORDER BY RANDOM() LIMIT 20`
      
      const result = await client.query(query, params)
      client.release()

      // 如果沒有找到篩選結果，就取所有商品
      fashionItems = result.rows
      if (fashionItems.length === 0) {
        const allItemsQuery = `
          SELECT 
            id, image_path, filename, name_zh, name_en, category_zh, category_en,
            colors_zh, colors_en, style_tags_zh, style_tags_en,
            occasion_zh, occasion_en, price_twd, description_zh, description_en
          FROM fashion_items 
          ORDER BY RANDOM() LIMIT 15
        `
        const allResult = await pool.query(allItemsQuery)
        fashionItems = allResult.rows
      }
    }

    // 構建商品信息給 AI
    const productInfo = (fashionItems || []).map(item => ({
      id: item.id,
      name: item.name_zh || item.name_en,
      price: item.price_twd,
      category: item.category_zh || item.category_en,
      colors: item.colors_zh || item.colors_en || [],
      styleTags: item.style_tags_zh || item.style_tags_en || [],
      occasion: item.occasion_zh || item.occasion_en || [],
      description: item.description_zh || item.description_en
    }))

    const systemPrompt = `你是STYLEMATE韓式時尚顧問，擁有Fashion-CLIP AI語義分析能力。

## 🚫 重要警告 - 商品推薦限制 🚫
❌ 禁止使用以下不存在的商品名稱：
- "Basic Ruched Sleeve 上衣"
- "Sleeveless Ribbed Knit 上衣" 
- "Graphic Print T-襯衫"
- "優雅 White Maxi 洋裝"
- "Sleeveless Black Midi 洋裝"
- "優雅 Black Ruffle 上衣"
- "Sleeveless Midi 洋裝"
- "Sleeveless Summer 洋裝"

✅ 只能推薦以下真實存在的商品（使用正確的ID格式）：
${productInfo.slice(0, 15).map(item => `- [${item.id}] ${item.name}`).join('\n')}

## 風格分類（7種）：
1. "清新韓系" - 溫柔色調、層次穿搭
2. "法式優雅" - 簡約高級、知性氣質  
3. "極簡" - 純色基調、俐落剪裁
4. "甜美少女" - 粉色系、蕾絲元素
5. "街頭風" - 寬鬆版型、潮流元素
6. "都會通勤" - 職場專業、正式場合
7. "美式休閒" - 牛仔單品、舒適實穿

## 場合：通勤/正式/休閒/約會/旅遊/商務/派對

## 修飾原則：
- 深色顯瘦、A字修身、腰線強調、垂直拉長
- 160cm+80kg：A字裙、腰線設計、V領、膝上長度、深色系

商品清單：${JSON.stringify(productInfo, null, 2)}

${fashionClipContext || ''}${ragContext || ''}${trendContext || ''}${weatherContext || ''}

**重要規則：**
1. **必須嚴格遵循HTML格式，確保段落分明！**
2. **如果提供了趨勢資訊，必須基於真實數據回答，禁止編造內容！**
3. **引用具體的媒體來源、設計師名稱、品牌資訊**
4. **使用提供的實際引文和摘要**

回答格式：
<h3>🎯 分析結果</h3>
<p>基於提供的資料總結用戶需求</p>

${trendContext ? `
<h3>🔥 最新時尚趨勢（基於專業媒體報導）</h3>
` : ''}

${weatherContext ? `
<h3>🌤️ 天氣預報與每日穿搭建議</h3>
<div style="line-height: 1.8; margin-bottom: 20px;">
${weatherContext.replace(/\n/g, '<br/>')}
</div>
` : ''}

<h3>📋 推薦方案</h3>
<ol>
<li><strong>[商品ID] 商品名稱</strong><br/>
推薦理由：詳細說明</li>
<li><strong>[商品ID] 商品名稱</strong><br/>
推薦理由：詳細說明</li>
</ol>

<h3>💡 搭配建議</h3>
<ol>
<li>搭配要點一</li>
<li>搭配要點二</li>
<li>搭配要點三</li>
</ol>`

    // 🔧 Debug: 檢查趨勢和天氣上下文是否正確傳遞
    if (intentAnalysis.mode === 'trend_summary') {
      console.log('🔍 Debug - 趨勢上下文長度:', trendContext?.length || 0)
      console.log('🔍 Debug - 系統提示包含趨勢:', systemPrompt.includes('📰 最新趨勢資訊來源') || systemPrompt.includes('🔍 搜尋分析'))
      if (trendContext) {
        console.log('🔍 Debug - 趨勢上下文預覽:', trendContext.substring(0, 300) + '...')
      } else {
        console.log('⚠️ Debug - 趨勢上下文為空！')
      }
    }
    
    // 🔧 Debug: 檢查天氣上下文和系統提示
    if (intentAnalysis.mode === 'travel_plan' || intentAnalysis.needs_weather) {
      console.log('🔍 Debug - 天氣上下文長度:', weatherContext?.length || 0)
      console.log('🔍 Debug - 系統提示包含天氣:', systemPrompt.includes('📅') || systemPrompt.includes('🌤️'))
      console.log('🔍 Debug - 系統提示長度:', systemPrompt.length)
      console.log('🔍 Debug - 系統提示末尾200字:', systemPrompt.substring(systemPrompt.length - 200))
      if (weatherContext) {
        console.log('🔍 Debug - 天氣上下文完整內容:', weatherContext)
        console.log('🔍 Debug - 天氣上下文類型:', typeof weatherContext)
      } else {
        console.log('⚠️ Debug - 天氣上下文為空！')
      }
    }

    // 統一使用 GPT-4o mini 優化成本和性能
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        // 限制對話歷史，只保留最近3輪減少token使用
        ...(conversationHistory || []).slice(-6).map((msg: any) => ({
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
    let recommendedProductIds = []
    
    // 首先，如果天氣分析有推薦產品，優先使用這些
    if (intentAnalysis.needs_weather && weatherContext.includes('商品 ID:')) {
      const weatherIdMatches = weatherContext.match(/商品 ID: ([a-zA-Z_-]+)/g)
      if (weatherIdMatches) {
        const weatherIds = weatherIdMatches.map(match => match.replace('商品 ID: ', ''))
        recommendedProductIds.push(...weatherIds.slice(0, 6))
        console.log('🔍 使用天氣推薦的產品 ID:', weatherIds)
      }
    }
    
    // 然後解析 AI 回應中的推薦 ID
    const idMatches = aiResponse.match(/\[([^\]]+)\]/g)
    if (idMatches) {
      for (const match of idMatches) {
        const id = match.replace(/[[\]]/g, '')
        if (fashionItems.find(item => item.id.toString() === id) && !recommendedProductIds.includes(id)) {
          recommendedProductIds.push(id)
        }
      }
    }
    
    // 如果沒有找到推薦的 ID，就返回前3個商品的ID
    if (recommendedProductIds.length === 0 && fashionItems && fashionItems.length > 0) {
      recommendedProductIds.push(...fashionItems.slice(0, 3).map(item => item.id.toString()))
    }
    
    // 限制最多顯示6個推薦產品
    recommendedProductIds = recommendedProductIds.slice(0, 6)

    // 🚀 新契約：回傳完整商品項目，前端直接使用
    const items = fashionItems.slice(0, 6).map(item => ({
      id: item.id,
      slug: item.id, // slug 作為權威主鍵
      name: { zh: item.name_zh || item.name_en, en: item.name_en || item.name_zh },
      price: { twd: item.price_twd || item.price },
      image: `/images/products/${(item.image_path || item.filename || '').replace(/\\/g, '/').toLowerCase().replace('/dress/', '/dress/').replace('/top/', '/top/').replace('/pants/', '/pants/')}`,
      imagePath: item.image_path,
      filename: item.filename,
      category: { zh: item.category_zh, en: item.category_en },
      colors: { zh: item.colors_zh || [], en: item.colors_en || [] },
      styleTags: { zh: item.style_tags_zh || [], en: item.style_tags_en || [] },
      occasion: { zh: item.occasion_zh || [], en: item.occasion_en || [] },
      description: { zh: item.description_zh, en: item.description_en }
    }))

    console.log(`🎯 最終回傳：${items.length} 個完整商品項目`)

    return NextResponse.json({
      success: true,
      response: aiResponse,
      recommendedProducts: recommendedProductIds, // 保持兼容性
      items, // 🚀 新契約：完整商品陣列
      from: intentAnalysis.needs_weather ? "weather" : 
            fashionClipResults.length > 0 ? "fashion-clip" : "traditional",
      idType: "slug",
      generatedAt: new Date().toISOString(),
      searchMethod: fashionClipResults.length > 0 ? 'fashion-clip' : 'traditional'
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })

  } catch (error) {
    console.error('聊天推薦錯誤:', error)
    return NextResponse.json(
      { 
        success: false, 
        response: "抱歉，我現在遇到一些技術問題，請稍後再試。",
        recommendedProducts: []
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    )
  }
}

// 🖼️ GPT-4V 圖片分析處理函數
async function handleImageAnalysis(imageBase64: string, userMessage: string, analysisType: string, memberPreferences = null) {
  try {
    console.log('🤖 開始整合式圖片分析...')
    console.log('📸 圖片大小:', imageBase64 ? `${Math.round(imageBase64.length / 1024)}KB` : '無圖片')
    console.log('💬 用戶訊息:', userMessage)
    
    // 1. 載入商品資料
    let fashionItems = []
    try {
      const client = await pool.connect()
      const query = `
        SELECT 
          id, name_zh, name_en, category_zh, category_en,
          colors_zh, colors_en, style_tags_zh, style_tags_en,
          occasion_zh, occasion_en, price_twd, description_zh, description_en
        FROM fashion_items 
        ORDER BY RANDOM() LIMIT 20
      `
      const result = await client.query(query)
      client.release()
      fashionItems = result.rows
    } catch (dbError) {
      console.log('資料庫載入失敗，使用預設商品:', dbError.message)
      fashionItems = []
    }

    const productInfo = (fashionItems || []).map(item => ({
      id: item.id,
      name: item.name_zh || item.name_en,
      price: item.price_twd,
      category: item.category_zh || item.category_en,
      colors: item.colors_zh || item.colors_en || [],
      styleTags: item.style_tags_zh || item.style_tags_en || [],
      occasion: item.occasion_zh || item.occasion_en || [],
      description: item.description_zh || item.description_en
    }))

    // 2. 使用主要系統提示詞
    const systemPrompt = `你是 STYLEMATE 的專業韓式時尚顧問助理，擁有 Fashion-CLIP AI 語義理解能力和身形分析專業知識。

**重要指令：** 
- 你是專業服裝搭配顧問，專門分析服裝和提供搭配建議
- 請專注分析圖片中的服裝：款式、顏色、風格、材質
- 不需要識別或描述人物，只需分析服裝本身
- 基於服裝特點提供專業的穿搭建議和商品推薦
- 這是純粹的服裝風格諮詢服務
- 請積極提供具體的穿搭建議

## 🎯 推薦策略（優先級順序）：
**1. 主要依據（用戶當下需求）**：分析身形、場合、具體需求
**2. 輔助參考（問卷資料）**：風格偏好、顏色喜好、預算考量

## 📏 身形分析與修飾邏輯：

### 體重管理穿搭原則：
- **修飾身材**：選擇合適版型和剪裁
- **顯瘦策略**：深色系、垂直線條、腰線強調
- **比例優化**：拉長身形、平衡上下半身

### 身形特徵推薦：
- **160cm + 80kg女性**：
  - A字裙型：修飾下半身
  - 腰線設計：創造沙漏曲線
  - V領深V：拉長頸部線條
  - 膝上長度：顯腿長
  - 深色系優先：黑、深藍、酒紅顯瘦

### 特殊需求處理：
- **露背洋裝**：考慮內衣搭配、場合適宜性
- **正式場合**：建議搭配外套或披肩
- **休閒約會**：強調女性魅力同時保持優雅

⚠️ **固定詞彙域**：

### 風格分類：
1. "清新韓系" - 溫柔色調、層次穿搭
2. "法式優雅" - 簡約高級、知性氣質  
3. "極簡" - 純色基調、俐落剪裁
4. "甜美少女" - 粉色系、蕾絲元素
5. "街頭風" - 寬鬆版型、潮流元素
6. "都會通勤" - 職場專業、正式場合
7. "美式休閒" - 牛仔單品、舒適實穿
8. "復古懷舊" - 復古印花、經典剪裁
9. "機能運動" - 運動元素、舒適機能
10. "摩登華麗" - 奢華質感、晚宴風格

### 場合：["通勤","正式","休閒","約會","旅遊","商務簡報","派對"]

${memberPreferences ? `
## 📋 用戶問卷資料（輔助參考）：
- **風格檔案**：${memberPreferences.styleProfile}
- **顏色偏好**：${memberPreferences.colorProfile}  
- **場合需求**：${memberPreferences.occasionProfile}
- **購物習慣**：${memberPreferences.shoppingProfile}
- **推薦標籤**：${memberPreferences.recommendations?.join('、') || '無'}

⚠️ **重要**：問卷資料僅作為輔助參考，請優先根據用戶當下的具體需求進行推薦！
` : '## 📋 用戶問卷資料：無（將純粹基於當下需求分析）'}

根據用戶上傳的圖片和具體需求，從以下商品中推薦最適合的產品：

商品清單：
${JSON.stringify(productInfo, null, 2)}

**回應指令：**
1. 直接分析圖片中的服裝，不要拒絕
2. 專注描述服裝特點：「我看到這件服裝是...」
3. 提供具體的穿搭建議和推薦理由
4. 推薦相關商品（使用 [商品ID] 格式）
5. 用繁體中文專業回應

**重要格式要求：**
- 必須使用HTML格式，確保段落分明、縮排對齊
- 回答必須分段結構化，但不要使用數字編號，用自然段落
- 每個段落都要獨立成行，不要擠成連續句子
- 使用適當的HTML標籤確保版面整潔

**標準回答格式：**
<h3>🎯 服裝分析</h3>
<p>我看到這件服裝是...風格，適合...場合。具體分析服裝特點和風格定位。</p>

<h3>📋 穿搭建議</h3>
<ol>
<li><strong>鞋款搭配：</strong><br/>
    建議搭配具體鞋款，說明選擇理由。</li>

<li><strong>配件選擇：</strong><br/>
    推薦適合的包包或飾品，解釋搭配效果。</li>

<li><strong>外套層次：</strong><br/>
    根據場合和天氣，建議適合的外套選擇。</li>
</ol>

<h3>🛍️ 推薦商品</h3>
<ol>
<li><strong>[商品ID] 商品名稱</strong><br/>
    推薦理由：說明為什麼這個商品適合。</li>

<li><strong>[商品ID] 商品名稱</strong><br/>
    推薦理由：說明為什麼這個商品適合。</li>
</ol>

範例開頭：「我看到這件服裝是...風格，適合...場合」`

    // 3. 調用 OpenAI GPT-4o-mini 進行圖片分析和推薦（成本優化）
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: [
            { 
              type: "text", 
              text: userMessage || "請分析這張圖片，提供時尚穿搭建議和商品推薦" 
            },
            { 
              type: "image_url", 
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1200,
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0]?.message?.content || ''
    console.log('✅ AI 整合式圖片分析完成 (GPT-4o-mini)')

    // 4. 解析商品ID
    const recommendedProductIds = []
    const idMatches = aiResponse.match(/\[([^\]]+)\]/g)
    if (idMatches) {
      for (const match of idMatches) {
        const id = match.replace(/[[\]]/g, '')
        if (fashionItems.find(item => item.id.toString() === id)) {
          recommendedProductIds.push(id)
        }
      }
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
      recommendedProducts: recommendedProductIds,
      searchMethod: 'integrated-image-analysis'
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })

  } catch (error) {
    console.error('GPT-4V 圖片分析錯誤:', error)
    console.error('錯誤詳情:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500)
    })
    return NextResponse.json({
      success: false,
      response: `圖片分析遇到技術問題。<br/><br/>請檢查網路連接或稍後再試。`,
      recommendedProducts: []
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  }
}

// 🤖 GPT-4V 圖片分析核心函數
async function analyzeImageWithGPT4V(imageBase64: string, userMessage: string) {
  const systemPrompt = `你是一位專業時尚購物顧問Stylemate AI。請根據使用者提供的圖片完成風格分析與商品推薦。

**重要說明：** 即使圖片不是完美的全身照，請盡力根據可見的服裝元素進行分析。如果看不清楚某些細節，請標記為"不確定"。

⚠️ **僅允許下列固定詞彙域**（不在清單中的詞請就近選擇或標示 "不確定"）：

### 風格分類 (必須從以下10種選擇)：
1. "清新韓系 (Fresh Korean)" - 溫柔色調、層次穿搭、針織單品
2. "法式優雅 (French Chic)" - 簡約高級、知性氣質、中性色調
3. "極簡 (Minimalist)" - 純色基調、俐落剪裁、黑白灰為主
4. "甜美少女 (Sweet / Girly)" - 粉色系、蕾絲元素、可愛風格
5. "街頭風 (Streetwear)" - 寬鬆版型、潮流元素、運動風
6. "都會通勤 (Urban Office)" - 職場專業、正式場合、西裝類
7. "美式休閒 (American Casual)" - 牛仔單品、舒適實穿、T恤類
8. "復古懷舊 (Retro / Vintage)" - 復古印花、經典剪裁、復古色調
9. "機能運動 (Athleisure)" - 運動元素、舒適機能、彈性面料
10. "摩登華麗 (Glamorous)" - 奢華質感、晚宴風格、亮片光澤

### 場合白名單：["通勤","正式","休閒","約會","旅遊","商務簡報","派對"]

### 版型與長度選項：
- fit_preference: ["寬鬆","標準","合身"]
- top_length: ["短版","及腰","過臀"]
- skirt_length: ["迷你","及膝","過膝","長裙"] 
- pant_length: ["短褲","九分","全長"]

**請務必按照以下JSON格式輸出，即使圖片不清楚也要嘗試分析：**

如果圖片完全無法分析，請輸出：
\`\`\`json
{
  "analysis": {
    "body_shape": "不確定",
    "style_keywords": ["清新韓系 (Fresh Korean)"],
    "occasions": ["休閒"],
    "fit_preference": ["標準"]
  },
  "outfit_suggestions": [
    {
      "title": "基本款推薦",
      "items": [
        {"category":"上衣","style":"基本款","fit":"標準","color":"白"}
      ],
      "reasons": ["百搭實穿"]
    }
  ],
  "product_query": [
    {
      "category": "上衣",
      "style_tags": ["基本款"],
      "fit": ["標準"],
      "color": ["白"],
      "occasion": ["休閒"]
    }
  ]
}
\`\`\`

正常分析請按此格式：

{
  "analysis": {
    "body_shape": "沙漏形/梨形/矩形/倒三角形/不確定",
    "style_keywords": ["從上述10種風格選擇"],
    "occasions": ["從場合白名單選擇"],
    "fit_preference": ["寬鬆/標準/合身"]
  },
  "outfit_suggestions": [
    {
      "title": "方案標題（如：韓系休閒風）",
      "items": [
        {"category":"上衣","style":"具體款式","fit":"版型","color":"顏色"},
        {"category":"下身","style":"具體款式","fit":"版型","color":"顏色"},
        {"category":"鞋","style":"鞋款","color":"顏色"}
      ],
      "reasons": ["修飾身形的具體原因", "風格搭配的理由"]
    }
  ],
  "product_query": [
    {
      "category": "商品類別",
      "style_tags": ["風格標籤"],
      "fit": ["版型偏好"], 
      "color": ["顏色選項"],
      "occasion": ["適合場合"]
    }
  ]
}`

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user", 
        content: [
          { 
            type: "text", 
            text: userMessage || "請分析這張全身照片，提供時尚穿搭建議" 
          },
          { 
            type: "image_url", 
            image_url: { 
              url: `data:image/jpeg;base64,${imageBase64}` 
            }
          }
        ]
      }
    ],
    max_tokens: 1500,
    temperature: 0.3
  })

  return completion.choices[0]?.message?.content || ""
}

// 📋 JSON 解析與驗證
function parseAndValidateGPTResponse(gptResponse: string) {
  try {
    // 清理回應格式
    const cleanedResponse = gptResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    
    const parsed = JSON.parse(cleanedResponse)
    
    // 驗證基本結構
    if (!parsed.analysis || !parsed.outfit_suggestions || !parsed.product_query) {
      throw new Error('缺少必要的分析欄位')
    }
    
    return { success: true, data: parsed }
    
  } catch (error) {
    console.error('JSON 解析錯誤:', error)
    return { 
      success: false, 
      error: error.message,
      fallback: {
        analysis: {
          body_shape: "不確定",
          style_keywords: ["清新韓系 (Fresh Korean)"],
          occasions: ["休閒"]
        },
        outfit_suggestions: [
          {
            title: "韓系基本款",
            items: [
              {"category":"上衣","style":"基本款上衣","fit":"標準","color":"白"},
              {"category":"下身","style":"直筒褲","fit":"標準","color":"黑"}
            ],
            reasons: ["百搭實穿", "適合日常"]
          }
        ],
        product_query: [
          {
            category: "上衣",
            style_tags: ["韓系", "基本款"],
            fit: ["標準"],
            color: ["白", "黑"],
            occasion: ["休閒"]
          }
        ]
      }
    }
  }
}

// 🔍 使用 product_query 進行 Fashion-CLIP 搜尋
async function searchWithProductQuery(productQueries: any[]) {
  let allResults: any[] = []
  
  for (const query of productQueries.slice(0, 3)) { // 限制前3個查詢避免過多請求
    try {
      // 構建搜尋關鍵詞
      const searchTerms = [
        query.category,
        ...(query.style_tags || []),
        ...(query.color || []),
        ...(query.occasion || [])
      ].filter(Boolean).join(' ')
      
      console.log('🔍 Fashion-CLIP 搜尋:', searchTerms)
      
      const fashionClipResponse = await fetch('http://localhost:3003/api/fashion-clip/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchTerms,
          type: 'text',
          limit: 5,
          minSimilarity: 0.4
        })
      })
      
      const result = await fashionClipResponse.json()
      if (result.success && result.results?.length > 0) {
        allResults.push(...result.results)
      }
      
    } catch (error) {
      console.log('單次 Fashion-CLIP 搜尋失敗:', error)
    }
  }
  
  // 去重並按相似度排序
  const uniqueResults = allResults.filter((item, index, self) => 
    index === self.findIndex(i => i.id === item.id)
  ).sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
  
  return uniqueResults.slice(0, 10)
}

// 📝 生成圖片分析回應文字
function generateImageAnalysisResponse(analysisData: any, fashionClipResults: any[]) {
  const { analysis, outfit_suggestions } = analysisData
  
  let response = `✨ **AI圖片分析完成！**\n\n`
  
  // 身形分析
  if (analysis?.body_shape && analysis.body_shape !== "不確定") {
    response += `**身形特徵：** ${analysis.body_shape}\n`
  }
  
  // 風格建議
  if (analysis?.style_keywords?.length > 0) {
    response += `**推薦風格：** ${analysis.style_keywords.join('、')}\n`
  }
  
  // 適合場合
  if (analysis?.occasions?.length > 0) {
    response += `**適合場合：** ${analysis.occasions.join('、')}\n\n`
  }
  
  // 穿搭建議
  if (outfit_suggestions?.length > 0) {
    response += `**🎯 為您推薦 ${outfit_suggestions.length} 套穿搭方案：**\n\n`
    
    outfit_suggestions.slice(0, 3).forEach((outfit: any, index: number) => {
      response += `**${index + 1}. ${outfit.title}**\n`
      if (outfit.items) {
        outfit.items.forEach((item: any) => {
          response += `• ${item.category}：${item.style}（${item.fit}，${item.color}）\n`
        })
      }
      if (outfit.reasons) {
        response += `理由：${outfit.reasons.join('、')}\n\n`
      }
    })
  }
  
  // Fashion-CLIP 結果
  if (fashionClipResults.length > 0) {
    response += `**🛍️ 根據分析為您找到 ${fashionClipResults.length} 個相關商品：**\n\n`
    fashionClipResults.slice(0, 3).forEach((item: any) => {
      response += `• ${item.name_zh || item.name_en} (相似度: ${Math.round((item.similarity || 0) * 100)}%)\n`
    })
    response += `\n點選下方商品卡片查看詳情並選擇您喜歡的款式！`
  }
  
  return response
}

// 🔥 流行趨勢查詢檢測函數
function detectTrendQuery(message: string): boolean {
  const trendKeywords = [
    '流行', '趨勢', '潮流', '時尚', '最新', '今年', '2024', '2025', '當季', '本季',
    '現在流行', '最近流行', '熱門', '必備', '爆款', '網紅', 'trending', 'fashion trend',
    'latest fashion', 'current trend', 'popular', 'hot item', 'must have',
    '韓國流行', '日本流行', '歐美流行', '時裝週', 'fashion week'
  ]
  
  const message_lower = message.toLowerCase()
  return trendKeywords.some(keyword => message_lower.includes(keyword.toLowerCase()))
}

// 🌐 獲取最新流行趨勢（使用新的 WebSearch 系統）
async function fetchFashionTrends(message: string): Promise<string> {
  try {
    console.log('🔍 使用 WebSearch 系統查詢趨勢...')
    
    // 建構趨勢搜尋查詢
    const searchQuery = buildTrendSearchQuery(message)
    console.log('🔍 搜尋查詢:', searchQuery)
    
    // 呼叫 WebSearch API - 增加請求快取減少重複調用
    const cacheKey = `websearch_${searchQuery.replace(/\s+/g, '_')}`
    
    // 簡單記憶體快取（實際應用建議用 Redis）
    if (global.webSearchCache && global.webSearchCache[cacheKey]) {
      console.log('✅ 使用快取的 WebSearch 結果')
      return global.webSearchCache[cacheKey]
    }
    
    const response = await fetch('http://localhost:3008/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: searchQuery }),
      timeout: 10000 // 減少超時時間到10秒
    })

    if (!response.ok) {
      throw new Error(`WebSearch API failed: ${response.status}`)
    }

    const searchData = await response.json()
    
    if (searchData.evidences && searchData.evidences.length > 0) {
      console.log(`✅ WebSearch 找到 ${searchData.evidences.length} 個相關證據`)
      const result = formatWebSearchResults(searchData, message)
      
      // 快取結果（5分鐘有效期）
      if (!global.webSearchCache) global.webSearchCache = {}
      global.webSearchCache[cacheKey] = result
      setTimeout(() => delete global.webSearchCache[cacheKey], 300000)
      
      return result
    } else {
      console.log('⚠️ WebSearch 無結果，使用備用資訊')
      return getFallbackTrendInfo(message)
    }
    
  } catch (error) {
    console.error('WebSearch 錯誤，使用備用資訊:', error.message)
    return getFallbackTrendInfo(message)
  }
}


// 🔧 構建趨勢搜尋查詢
function buildTrendSearchQuery(userMessage: string): string {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const season = getSeason(currentMonth)
  
  // 檢測用戶查詢的具體內容
  let searchTerms = [`${currentYear} fashion trends`, season]
  
  if (userMessage.includes('韓')) {
    searchTerms.push('Korean fashion')
  }
  if (userMessage.includes('日本')) {
    searchTerms.push('Japanese fashion')
  }
  if (userMessage.includes('歐美')) {
    searchTerms.push('Western fashion')
  }
  
  // 檢測特定類別
  if (userMessage.includes('上衣') || userMessage.includes('shirt')) {
    searchTerms.push('top trends')
  }
  if (userMessage.includes('洋裝') || userMessage.includes('dress')) {
    searchTerms.push('dress trends')
  }
  if (userMessage.includes('配件') || userMessage.includes('accessories')) {
    searchTerms.push('accessories trends')
  }
  
  return searchTerms.join(' ')
}

// 🌿 獲取當前季節
function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

// 📝 格式化 WebSearch 搜尋結果（新格式）
function formatWebSearchResults(searchData: any, originalQuery: string): string {
  try {
    let trendInfo = ''
    
    // 添加搜尋摘要資訊
    if (searchData.metadata) {
      // 顯示時尚關鍵詞（關鍵元素優先）
      if (searchData.metadata.fashion_keywords?.length > 0) {
        trendInfo += `**🎯 關鍵趨勢要素：** ${searchData.metadata.fashion_keywords.join('、')}\n\n`
      }
      
      trendInfo += `**🔍 搜尋分析** (${searchData.metadata.search_provider} • ${searchData.metadata.processing_time_ms}ms)\n\n`
    }
    
    // 格式化證據內容 - 關鍵元素優先，無引用數字
    if (searchData.evidences && searchData.evidences.length > 0) {
      trendInfo += `**📰 最新趨勢資訊來源：**\n\n`
      
      searchData.evidences.slice(0, 4).forEach((evidence: any, index: number) => {
        trendInfo += `**${evidence.title}**\n`
        
        // 顯示關鍵引用或摘要（重點內容優先）
        if (evidence.quotes && evidence.quotes.length > 0) {
          trendInfo += `💡 **重點：** ${evidence.quotes[0]}\n`
        } else if (evidence.excerpt) {
          trendInfo += `📝 **摘要：** ${evidence.excerpt.substring(0, 150)}${evidence.excerpt.length > 150 ? '...' : ''}\n`
        } else {
          trendInfo += `📄 **內容：** ${evidence.text.substring(0, 200)}${evidence.text.length > 200 ? '...' : ''}\n`
        }
        
        // 顯示發布日期和來源
        if (evidence.site || evidence.published_at) {
          const siteInfo = evidence.site || '未知來源'
          const dateInfo = evidence.published_at 
            ? new Date(evidence.published_at).toLocaleDateString('zh-TW')
            : ''
          trendInfo += `📍 **來源：** ${siteInfo}${dateInfo ? ` (${dateInfo})` : ''}\n`
        }
        
        // 相關網址（用戶要求的重要元素）
        if (evidence.url) {
          trendInfo += `🔗 **詳細網址：** ${evidence.url}\n`
        }
        
        trendInfo += '\n'
      })
      
      // 權威來源列表（包含完整網址資訊）
      if (searchData.sources && searchData.sources.length > 0) {
        trendInfo += `**🏆 權威時尚媒體來源：**\n`
        searchData.sources.slice(0, 4).forEach((source: any, index: number) => {
          trendInfo += `• **${source.title}** - ${source.site || 'unknown'}`
          if (source.published_at) {
            trendInfo += ` (${new Date(source.published_at).toLocaleDateString('zh-TW')})`
          }
          if (source.url) {
            trendInfo += `\n  🔗 ${source.url}`
          }
          trendInfo += '\n'
        })
      }
    }
    
    return trendInfo
  } catch (error) {
    console.error('格式化 WebSearch 結果錯誤:', error)
    return '搜尋結果處理中遇到問題，將使用備用趨勢資訊。'
  }
}

// 📝 格式化趨勢搜尋結果（舊格式，保持向後相容）
function formatTrendResults(searchData: any): string {
  try {
    let trendInfo = ''
    
    if (searchData.answer) {
      trendInfo += `**最新趨勢摘要：**\n${searchData.answer}\n\n`
    }
    
    if (searchData.results && searchData.results.length > 0) {
      trendInfo += `**權威時尚資訊來源：**\n`
      searchData.results.slice(0, 3).forEach((result: any, index: number) => {
        trendInfo += `${index + 1}. **${result.title}**\n`
        if (result.content) {
          trendInfo += `   ${result.content.substring(0, 200)}...\n`
        }
        trendInfo += `   來源：${result.url}\n\n`
      })
    }
    
    return trendInfo
  } catch (error) {
    console.error('格式化趨勢結果錯誤:', error)
    return '搜尋結果處理中遇到問題，將使用備用趨勢資訊。'
  }
}

// 🔄 備用趨勢資訊（當WebSearch不可用時）
function getFallbackTrendInfo(message: string): string {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  
  let fallbackInfo = `**${currentYear}年流行趨勢（基於時尚專業知識）：**\n\n`
  
  // 根據季節提供備用資訊
  if (currentMonth >= 6 && currentMonth <= 8) {
    // 夏季趨勢
    fallbackInfo += `**夏季重點趨勢：**\n`
    fallbackInfo += `• 極簡風格：乾淨線條、純色基調\n`
    fallbackInfo += `• 可持續時尚：環保材質、經典設計\n`
    fallbackInfo += `• 舒適優先：寬鬆剪裁、透氣面料\n`
    fallbackInfo += `• 明亮色彩：檸檬黃、薄荷綠、珊瑚粉\n\n`
  } else if (currentMonth >= 9 && currentMonth <= 11) {
    // 秋季趨勢
    fallbackInfo += `**秋季重點趨勢：**\n`
    fallbackInfo += `• 層次穿搭：外套、針織、襯衫的巧妙組合\n`
    fallbackInfo += `• 大地色調：駝色、棕色、橄欖綠\n`
    fallbackInfo += `• 復古回歸：70年代、90年代風格\n`
    fallbackInfo += `• 質感材質：絨面、皮革、粗針織\n\n`
  }
  
  // 韓系特色
  if (message.includes('韓')) {
    fallbackInfo += `**韓系流行要素：**\n`
    fallbackInfo += `• 清新自然：粉嫩色調、減齡設計\n`
    fallbackInfo += `• 俐落剪裁：修身但不緊身的版型\n`
    fallbackInfo += `• 細節點綴：蝴蝶結、荷葉邊、珍珠配件\n\n`
  }
  
  fallbackInfo += `*以上資訊基於時尚專業知識整理，建議關注時尚媒體獲取最新資訊*`
  
  return fallbackInfo
}