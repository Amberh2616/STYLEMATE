import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
})

// 🧪 GPT-4V 測試端點
export async function POST(request: NextRequest) {
  try {
    const { image, message = "請分析這張圖片" } = await request.json()
    
    if (!image) {
      return NextResponse.json({
        success: false,
        error: "需要提供 base64 圖片數據"
      }, { status: 400 })
    }

    console.log('🧪 測試 GPT-4V 圖片分析...')
    
    const systemPrompt = `你是 STYLEMATE 的專業時尚顧問，專門分析服裝和提供搭配建議。

**重要指令：** 
- 你是專業服裝搭配顧問，專門分析服裝和提供搭配建議
- 請專注分析圖片中的服裝：款式、顏色、風格、材質
- 基於服裝特點提供專業的穿搭建議
- 即使圖片不清楚，也請嘗試提供基本的時尚建議

請分析圖片並回應，如果圖片無法分析，請提供一般的韓系時尚建議。

輸出 JSON 格式：
{
  "analysis": {
    "image_status": "可分析/無法分析",
    "style_keywords": ["清新韓系 (Fresh Korean)"],
    "occasions": ["休閒"]
  },
  "outfit_suggestions": [
    {
      "title": "韓系休閒風",
      "items": [
        {"category":"上衣","style":"基本款","fit":"標準","color":"白"}
      ],
      "reasons": ["百搭實穿"]
    }
  ],
  "product_query": [
    {
      "category": "上衣",
      "style_tags": ["韓系"],
      "occasion": ["休閒"]
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
            { type: "text", text: message },
            { 
              type: "image_url", 
              image_url: { 
                url: `data:image/jpeg;base64,${image}` 
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    })

    const rawResponse = completion.choices[0]?.message?.content || ""
    
    // 嘗試解析 JSON
    let parsedResponse = null
    let parseError = null
    
    try {
      // 提取 JSON 部分（處理多種格式）
      let cleanedResponse = rawResponse
      
      // 如果包含 ```json 標記，提取其中內容
      const jsonMatch = rawResponse.match(/```json\n?([\s\S]*?)\n?```/)
      if (jsonMatch) {
        cleanedResponse = jsonMatch[1].trim()
      } else {
        // 嘗試找到 JSON 物件
        const jsonObjectMatch = rawResponse.match(/\{[\s\S]*\}/)
        if (jsonObjectMatch) {
          cleanedResponse = jsonObjectMatch[0].trim()
        } else {
          cleanedResponse = rawResponse.trim()
        }
      }
      
      parsedResponse = JSON.parse(cleanedResponse)
      console.log('✅ JSON 解析成功')
    } catch (error) {
      parseError = error.message
      console.error('❌ JSON 解析失敗:', error)
    }

    return NextResponse.json({
      success: true,
      raw_response: rawResponse,
      parsed_response: parsedResponse,
      parse_error: parseError,
      model_used: "gpt-4o-mini",
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('GPT-4V 測試錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// GET 端點用於測試連接
export async function GET() {
  return NextResponse.json({
    message: "GPT-4V 測試端點已就緒",
    available_models: ["gpt-4o-mini"],
    usage: "POST 請求包含 { image: 'base64_string', message?: 'optional_prompt' }"
  })
}