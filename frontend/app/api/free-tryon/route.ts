import { NextRequest, NextResponse } from 'next/server'

// 免費的虛擬試穿 API - 使用 Hugging Face Spaces
export async function POST(request: NextRequest) {
  try {
    const { userPhotoBase64, clothingImageBase64 } = await request.json()

    console.log('🆓 開始免費 AI 試穿...')

    if (!userPhotoBase64 || !clothingImageBase64) {
      return NextResponse.json({
        success: false,
        error: '需要人物照片和服裝圖片'
      }, { status: 400 })
    }

    // 使用免費的 Hugging Face Gradio API
    try {
      console.log('📤 調用免費 Gradio API...')
      
      // 這是一個模擬的回應，因為真正的 Gradio 調用需要特殊處理
      // 您也可以手動到 https://huggingface.co/spaces/yisol/IDM-VTON 測試
      
      const simulatedResult = await createSimulatedResult(userPhotoBase64, clothingImageBase64)
      
      return NextResponse.json({
        success: true,
        result: {
          originalPhoto: userPhotoBase64,
          finalResult: simulatedResult,
          processingTime: 3000,
          model: '免費體驗版',
          analysis: {
            method: 'gradio_simulation',
            message: '如需真正的 AI 試穿，請使用付費 Replicate 服務'
          }
        }
      })

    } catch (error) {
      throw new Error(`免費服務暫時不可用: ${error.message}`)
    }

  } catch (error) {
    console.error('❌ 免費試穿失敗:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      suggestion: '建議使用付費 Replicate 服務獲得最佳效果'
    }, { status: 500 })
  }
}

// 創建改進版的模擬結果
async function createSimulatedResult(personBase64: string, clothingBase64: string) {
  const sharp = require('sharp')
  
  try {
    // 處理圖片
    const personBuffer = Buffer.from(personBase64.split(',')[1], 'base64')
    const clothingBuffer = Buffer.from(clothingBase64.split(',')[1], 'base64')
    
    const personImage = sharp(personBuffer)
    const { width, height } = await personImage.metadata()
    
    // 改進的合成算法
    const processedClothing = await sharp(clothingBuffer)
      .resize({
        width: Math.round((width || 400) * 0.45),
        height: Math.round((height || 600) * 0.35),
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .modulate({
        brightness: 0.9,
        saturation: 1.05
      })
      .png()
      .toBuffer()

    // 更智能的定位
    const composite = await personImage
      .composite([{
        input: processedClothing,
        left: Math.round((width || 400) * 0.275),
        top: Math.round((height || 600) * 0.25),
        blend: 'over'
      }])
      .png()
      .toBuffer()

    return `data:image/png;base64,${composite.toString('base64')}`

  } catch (error) {
    throw new Error('圖片處理失敗')
  }
}