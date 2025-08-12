import { NextRequest, NextResponse } from 'next/server'
import { client } from "@gradio/client"

// 使用 @gradio/client 連線 Hugging Face Spaces
export async function POST(request: NextRequest) {
  try {
    const { userPhotoBase64, clothingImageBase64 } = await request.json()

    console.log('🤖 使用 @gradio/client 連線 Hugging Face Spaces...')

    if (!userPhotoBase64 || !clothingImageBase64) {
      return NextResponse.json({
        success: false,
        error: '需要人物照片和服裝圖片'
      }, { status: 400 })
    }

    // 嘗試多個可用的 Space
    const spaces = [
      'yisol/IDM-VTON',
      'levihsu/OOTDiffusion',
      'Nymbo/Virtual-Try-On'
    ]

    for (const spaceName of spaces) {
      try {
        console.log(`🔗 嘗試連線到 Space: ${spaceName}`)
        
        // 連線到 Gradio Space
        const app = await client(spaceName)
        
        console.log('✅ Space 連線成功，開始預測...')
        
        // 根據不同的 Space 使用不同的參數格式
        let result
        if (spaceName === 'yisol/IDM-VTON') {
          // IDM-VTON 參數格式
          result = await app.predict("/predict", [
            userPhotoBase64,      // 人物圖片
            clothingImageBase64,  // 服裝圖片
            "upper body clothing", // 描述
            true,                // is_checked
            false,               // is_checked_crop
            20,                  // denoise_steps
            42                   // seed
          ])
        } else if (spaceName === 'levihsu/OOTDiffusion') {
          // OOTDiffusion 參數格式
          result = await app.predict("/predict", [
            userPhotoBase64,
            clothingImageBase64,
            "Upper-body",
            1,  // num_inference_steps
            42  // seed
          ])
        } else {
          // 通用格式
          result = await app.predict("/predict", [
            userPhotoBase64,
            clothingImageBase64,
            "A person wearing the clothing"
          ])
        }
        
        console.log('📊 Gradio 預測結果:', result)
        
        if (result && result.data && result.data[0]) {
          console.log('🎉 Gradio 試穿成功！')
          
          return NextResponse.json({
            success: true,
            result: {
              originalPhoto: userPhotoBase64,
              finalResult: result.data[0],
              processingTime: 5000,
              model: `Gradio Space: ${spaceName}`,
              analysis: {
                method: 'gradio_client',
                space: spaceName,
                confidence: 0.85
              }
            }
          })
        }
        
      } catch (spaceError) {
        console.log(`❌ Space ${spaceName} 失敗:`, spaceError.message)
        continue
      }
    }

    // 所有 Space 都失敗，回傳錯誤
    return NextResponse.json({
      success: false,
      error: '所有 Hugging Face Spaces 都不可用',
      suggestions: [
        '1. Space 可能正在載入或維護中',
        '2. 嘗試直接訪問 https://huggingface.co/spaces/yisol/IDM-VTON',
        '3. 考慮使用付費 Replicate 服務'
      ]
    }, { status: 503 })

  } catch (error) {
    console.error('❌ Gradio client 錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      hint: '確認網路連線和 Space 可用性'
    }, { status: 500 })
  }
}