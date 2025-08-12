import { NextRequest, NextResponse } from 'next/server'
import { Client } from "@gradio/client"

// 探索 Hugging Face Space 的 API 接口
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 探索 yisol/IDM-VTON Space API...')
    
    // 連線到 Space
    const client = await Client.connect("yisol/IDM-VTON")
    
    // 使用 view_api() 查看可用接口
    const apiInfo = await client.view_api()
    
    console.log('📋 Space API 資訊:', apiInfo)
    
    return NextResponse.json({
      success: true,
      space: 'yisol/IDM-VTON',
      apiInfo: apiInfo,
      endpoints: apiInfo.named_endpoints || {},
      message: '成功獲取 Space API 資訊'
    })
    
  } catch (error) {
    console.error('❌ 探索 Space 失敗:', error)
    
    // 嘗試其他 Space
    const backupSpaces = [
      'levihsu/OOTDiffusion',
      'Nymbo/Virtual-Try-On'
    ]
    
    const results = []
    
    for (const spaceName of backupSpaces) {
      try {
        console.log(`🔍 探索備用 Space: ${spaceName}`)
        const client = await Client.connect(spaceName)
        const apiInfo = await client.view_api()
        
        results.push({
          space: spaceName,
          status: 'success',
          apiInfo: apiInfo,
          endpoints: apiInfo.named_endpoints || {}
        })
        
      } catch (spaceError) {
        results.push({
          space: spaceName,
          status: 'failed',
          error: spaceError.message
        })
      }
    }
    
    return NextResponse.json({
      success: false,
      mainSpaceError: error.message,
      backupResults: results,
      message: '主要 Space 失敗，但獲取了備用 Space 資訊'
    }, { status: 207 }) // 207 = Multi-Status
  }
}

// POST 方法：測試特定 Space 的接口調用
export async function POST(request: NextRequest) {
  try {
    const { spaceName, endpoint, testData } = await request.json()
    
    console.log(`🧪 測試 ${spaceName} 的 ${endpoint} 接口...`)
    
    const client = await Client.connect(spaceName || "yisol/IDM-VTON")
    
    // 先查看 API
    const apiInfo = await client.view_api()
    console.log('📋 API 資訊:', apiInfo)
    
    // 測試接口調用（使用假數據）
    const testResult = await client.predict(endpoint || "/predict", testData || {
      dict: "test",
      garm_img: "test",
      garment_des: "test clothing",
      is_checked: true,
      is_checked_crop: false,
      denoise_steps: 20,
      seed: 42
    })
    
    return NextResponse.json({
      success: true,
      space: spaceName || "yisol/IDM-VTON",
      endpoint: endpoint || "/predict",
      apiInfo: apiInfo,
      testResult: testResult,
      message: '接口測試完成'
    })
    
  } catch (error) {
    console.error('❌ 接口測試失敗:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      message: '接口測試失敗'
    }, { status: 500 })
  }
}