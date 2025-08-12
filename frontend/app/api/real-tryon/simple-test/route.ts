import { NextRequest, NextResponse } from 'next/server'

// 簡化版 AI 試穿測試
export async function POST(request: NextRequest) {
  try {
    const { userPhotoBase64, clothingImageBase64, poseData } = await request.json()

    console.log('🧪 簡化版 AI 試穿測試...')
    
    // 模擬處理時間
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 返回測試結果
    return NextResponse.json({
      success: true,
      result: {
        originalPhoto: userPhotoBase64,
        finalResult: userPhotoBase64, // 先返回原圖作為測試
        processingTime: 2000,
        model: '測試模式 - 無需API Token',
        analysis: {
          pose: poseData,
          confidence: 0.9,
          method: 'simulation_test'
        }
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}