import { NextRequest, NextResponse } from 'next/server'

// Replicate IDM-VTON API 整合
export async function POST(request: NextRequest) {
  try {
    const { userPhotoBase64, clothingImageBase64, poseData } = await request.json()

    console.log('🚀 開始真正的 AI 試穿 (Replicate IDM-VTON)...')
    console.log('📷 用戶照片大小:', userPhotoBase64?.length)
    console.log('👕 服裝圖片大小:', clothingImageBase64?.length)
    console.log('🤖 姿態數據:', poseData?.landmarks?.length, '個關鍵點')

    if (!userPhotoBase64 || !clothingImageBase64) {
      return NextResponse.json({
        success: false,
        error: '需要用戶照片和服裝圖片'
      }, { status: 400 })
    }

    // 🤖 調用 Replicate IDM-VTON API
    const tryOnResult = await callReplicateIDMVTON({
      personImage: userPhotoBase64,
      clothingImage: clothingImageBase64,
      poseData
    })

    return NextResponse.json({
      success: true,
      result: {
        originalPhoto: userPhotoBase64,
        finalResult: tryOnResult.image,
        processingTime: tryOnResult.processingTime,
        model: 'Replicate IDM-VTON',
        analysis: {
          pose: poseData,
          confidence: tryOnResult.confidence,
          method: 'commercial_virtual_tryon'
        }
      }
    })

  } catch (error) {
    console.error('❌ Replicate 試穿失敗:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      fallback: '建議嘗試 Hugging Face API 或檢查 API Token 設定'
    }, { status: 500 })
  }
}

// 🤖 調用 Replicate IDM-VTON 模型
async function callReplicateIDMVTON(params: {
  personImage: string
  clothingImage: string
  poseData?: any
}) {
  const startTime = Date.now()
  
  try {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN
    
    if (!REPLICATE_API_TOKEN) {
      throw new Error('未設定 Replicate API Token，請在 .env.local 中添加 REPLICATE_API_TOKEN')
    }

    console.log('📤 發送請求到 Replicate IDM-VTON...')

    // 直接使用 base64 數據（簡化方案）
    const personImageData = params.personImage
    const clothingImageData = params.clothingImage

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
        input: {
          human_img: personImageData,
          garm_img: clothingImageData,
          garment_des: "upper body clothing item",
          category: "upper_body",
          crop: false,
          steps: 30,
          seed: 42
        }
      })
    })

    const prediction = await response.json()
    
    if (!response.ok) {
      console.log('❌ Replicate API 詳細錯誤:', prediction)
      throw new Error(`Replicate API 錯誤 (${response.status}): ${prediction.detail || prediction.error || 'Unknown error'}`)
    }

    console.log('⏳ Replicate 處理中，預測 ID:', prediction.id)

    // Replicate 是異步處理，需要輪詢結果
    let result = prediction
    let attempts = 0
    const maxAttempts = 60 // 最多等待1分鐘

    while ((result.status === 'starting' || result.status === 'processing') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // 等待2秒
      attempts++
      
      console.log(`🔄 檢查狀態... (${attempts}/${maxAttempts})`)
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        }
      })
      
      result = await statusResponse.json()
      console.log('📊 當前狀態:', result.status)
    }

    if (result.status === 'succeeded' && result.output) {
      const processingTime = Date.now() - startTime
      
      console.log('✅ Replicate IDM-VTON 成功!')
      console.log(`⏱️ 總處理時間: ${processingTime}ms`)
      
      // IDM-VTON 返回圖片 URL，需要轉換為 base64
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output
      const base64Image = await convertUrlToBase64(imageUrl)
      
      return {
        image: base64Image,
        processingTime,
        confidence: 0.95, // IDM-VTON 是最好的商用模型
        model: 'IDM-VTON (cuuupid/idm-vton)',
        method: 'commercial_virtual_tryon'
      }
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('處理超時，請稍後重試')
    }
    
    throw new Error(`Replicate 處理失敗: ${result.error || result.status}`)
    
  } catch (error) {
    console.error('💥 Replicate API 調用失敗:', error)
    throw error
  }
}

// 上傳圖片到 Replicate 並獲取 URL
async function uploadImageToReplicate(base64Image: string, apiToken: string): Promise<string> {
  try {
    // 移除 base64 前綴
    const base64Data = base64Image.replace(/^data:image\/[^;]+;base64,/, '')
    
    // 轉換為 Blob
    const imageBuffer = Buffer.from(base64Data, 'base64')
    
    // 上傳到 Replicate
    const response = await fetch('https://api.replicate.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/octet-stream'
      },
      body: imageBuffer
    })
    
    if (!response.ok) {
      throw new Error(`圖片上傳失敗: ${response.status}`)
    }
    
    const result = await response.json()
    return result.urls.get
    
  } catch (error) {
    console.error('圖片上傳錯誤:', error)
    // 備用方案：直接使用 base64
    return base64Image
  }
}

// 將 URL 轉換為 base64
async function convertUrlToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`獲取圖片失敗: ${response.status}`)
    }
    
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    
    // 假設是 PNG 格式，實際中可以從 URL 或響應頭推斷
    return `data:image/png;base64,${base64}`
    
  } catch (error) {
    console.error('URL 轉 base64 失敗:', error)
    return imageUrl // 返回原始 URL
  }
}