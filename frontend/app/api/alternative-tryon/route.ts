import { NextRequest, NextResponse } from 'next/server'

// 使用替代免費虛擬試穿服務
export async function POST(request: NextRequest) {
  try {
    const { userPhotoBase64, clothingImageBase64 } = await request.json()

    console.log('🆓 嘗試免費替代虛擬試穿服務...')

    if (!userPhotoBase64 || !clothingImageBase64) {
      return NextResponse.json({
        success: false,
        error: '需要人物照片和服裝圖片'
      }, { status: 400 })
    }

    // 嘗試多個免費的 Hugging Face Spaces
    const freeServices = [
      {
        name: 'OOTDiffusion',
        url: 'https://levihsu-ootdiffusion.hf.space/api/predict',
        format: 'ootd'
      },
      {
        name: 'VITON-HD',
        url: 'https://chrisjay-viton-hd.hf.space/api/predict', 
        format: 'viton'
      }
    ]

    for (const service of freeServices) {
      try {
        console.log(`📤 嘗試 ${service.name}...`)
        
        const response = await fetch(service.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: service.format === 'ootd' ? [
              userPhotoBase64,
              clothingImageBase64,
              "Upper-body",
              1, // num_inference_steps
              42 // seed
            ] : [
              userPhotoBase64,
              clothingImageBase64,
              "A person wearing the clothing"
            ]
          })
        })

        if (response.ok) {
          const result = await response.json()
          
          if (result.data && result.data[0]) {
            console.log(`✅ ${service.name} 成功!`)
            
            return NextResponse.json({
              success: true,
              result: {
                originalPhoto: userPhotoBase64,
                finalResult: result.data[0],
                processingTime: 5000,
                model: service.name,
                analysis: {
                  method: 'free_ai_service',
                  provider: service.name
                }
              }
            })
          }
        }
        
        console.log(`❌ ${service.name} 失敗`)
        
      } catch (error) {
        console.log(`💥 ${service.name} 錯誤:`, error.message)
        continue
      }
    }

    // 如果所有免費服務都失敗，提供建議
    return NextResponse.json({
      success: false,
      error: '所有免費 AI 服務暫時不可用',
      suggestions: [
        '1. 手動使用 https://huggingface.co/spaces/yisol/IDM-VTON',
        '2. 購買少量 Replicate 額度 ($5-10)',
        '3. 等待免費服務恢復'
      ]
    }, { status: 503 })

  } catch (error) {
    console.error('❌ 替代試穿服務錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}