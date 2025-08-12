import { NextRequest, NextResponse } from 'next/server'
import { Client } from "@gradio/client"

// 測試 Space 連接和接口
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 測試連接到 amber2616/STYLEMATE Space...')
    
    const client = await Client.connect("amber2616/STYLEMATE", {
      hf_token: process.env.HF_TOKEN || undefined,
    })
    
    // 查看 API 結構
    const apiInfo = await client.view_api()
    console.log('📋 完整 API 資訊:', JSON.stringify(apiInfo, null, 2))
    
    // 嘗試使用樣本圖片進行測試
    console.log('🧪 嘗試樣本圖片測試...')
    
    const testPersonUrl = "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
    const testClothUrl = "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
    
    let result
    try {
      // 使用文檔中的格式
      result = await client.predict("/tryon", {
        person_img: {
          url: testPersonUrl,
          meta: {
            "_type": "gradio.FileData"
          },
          orig_name: "person.png"
        },
        cloth_img: {
          url: testClothUrl,
          meta: {
            "_type": "gradio.FileData"
          },
          orig_name: "cloth.png"
        }
      })
      
      console.log('✅ 測試成功！結果:', JSON.stringify(result, null, 2))
      
    } catch (testError) {
      console.error('❌ 測試失敗:', JSON.stringify(testError, null, 2))
    }
    
    return NextResponse.json({
      success: true,
      space: 'amber2616/STYLEMATE',
      apiInfo: apiInfo,
      testResult: result || null,
      message: '成功獲取 Space 資訊'
    })
    
  } catch (error) {
    console.error('❌ Space 連接失敗:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}