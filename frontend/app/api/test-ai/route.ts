import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    console.log('測試 API 啟動')
    console.log('API Key:', process.env.OPEN_AI_API_KEY ? '已設定' : '未設定')
    
    const openai = new OpenAI({
      apiKey: process.env.OPEN_AI_API_KEY,
    })

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // 用更便宜的模型測試
      messages: [
        {
          role: "user",
          content: "請用繁體中文說：你好！"
        }
      ],
      temperature: 0.7,
      max_tokens: 50,
    })

    const response = completion.choices[0]?.message?.content || "無回應"
    
    return NextResponse.json({
      success: true,
      message: "API 測試成功",
      ai_response: response,
      api_key_status: process.env.OPEN_AI_API_KEY ? "已設定" : "未設定"
    })

  } catch (error: any) {
    console.error('測試錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error.message || "未知錯誤",
      api_key_status: process.env.OPEN_AI_API_KEY ? "已設定" : "未設定"
    }, { status: 500 })
  }
}