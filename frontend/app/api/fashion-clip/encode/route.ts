import { NextRequest, NextResponse } from 'next/server'
import { HfInference } from '@huggingface/inference'

// 初始化 Hugging Face 推理客戶端
const hf = new HfInference(process.env.HUGGING_FACE_API_TOKEN)

export async function POST(request: NextRequest) {
  try {
    const { text, image, type } = await request.json()

    console.log('🎨 Fashion-CLIP 編碼請求:', { type, hasText: !!text, hasImage: !!image })

    if (!text && !image) {
      return NextResponse.json({
        success: false,
        error: '需要提供文字或圖像輸入'
      }, { status: 400 })
    }

    if (!process.env.HUGGING_FACE_API_TOKEN) {
      return NextResponse.json({
        success: false,
        error: '未設定 Hugging Face API Token'
      }, { status: 500 })
    }

    let embedding: number[] = []
    let processingInfo: any = {}

    if (type === 'text' && text) {
      // 文字編碼
      const result = await encodeText(text)
      embedding = result.embedding
      processingInfo = result.info
    } else if (type === 'image' && image) {
      // 圖像編碼
      const result = await encodeImage(image)
      embedding = result.embedding
      processingInfo = result.info
    } else {
      return NextResponse.json({
        success: false,
        error: '無效的編碼類型或輸入'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      embedding,
      dimensions: embedding.length,
      type,
      processingInfo
    })

  } catch (error) {
    console.error('❌ Fashion-CLIP 編碼錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Fashion-CLIP 編碼失敗'
    }, { status: 500 })
  }
}

// 📝 文字編碼函數
async function encodeText(text: string) {
  const startTime = Date.now()
  
  try {
    // 使用 Fashion-CLIP 模型進行文字編碼
    const response = await hf.featureExtraction({
      model: 'patrickjohncyh/fashion-clip',
      inputs: text,
    })

    const embedding = Array.isArray(response) ? response : Array.from(response as any)
    const processingTime = Date.now() - startTime

    console.log('✅ 文字編碼成功:', {
      text: text.substring(0, 50) + '...',
      dimensions: embedding.length,
      processingTime: `${processingTime}ms`
    })

    return {
      embedding,
      info: {
        model: 'fashion-clip',
        type: 'text',
        inputLength: text.length,
        processingTime,
        dimensions: embedding.length
      }
    }
  } catch (error) {
    console.error('❌ 文字編碼失敗:', error)
    
    // 備用方案：使用 OpenAI embeddings
    return await encodeTextWithOpenAI(text)
  }
}

// 🖼️ 圖像編碼函數
async function encodeImage(imageData: string) {
  const startTime = Date.now()
  
  try {
    // 處理 base64 圖像數據
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData
    const imageBuffer = Buffer.from(base64Data, 'base64')

    // 使用 Fashion-CLIP 模型進行圖像編碼
    const response = await hf.featureExtraction({
      model: 'patrickjohncyh/fashion-clip',
      data: imageBuffer,
    })

    const embedding = Array.isArray(response) ? response : Array.from(response as any)
    const processingTime = Date.now() - startTime

    console.log('✅ 圖像編碼成功:', {
      imageSize: `${Math.round(imageBuffer.length / 1024)}KB`,
      dimensions: embedding.length,
      processingTime: `${processingTime}ms`
    })

    return {
      embedding,
      info: {
        model: 'fashion-clip',
        type: 'image',
        imageSize: imageBuffer.length,
        processingTime,
        dimensions: embedding.length
      }
    }
  } catch (error) {
    console.error('❌ 圖像編碼失敗:', error)
    
    // 備用方案：使用模擬編碼
    return await createMockImageEmbedding(imageData)
  }
}

// 🔄 備用方案：OpenAI 文字編碼
async function encodeTextWithOpenAI(text: string) {
  try {
    const OpenAI = require('openai')
    const openai = new OpenAI({
      apiKey: process.env.OPEN_AI_API_KEY,
    })

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    })

    const embedding = response.data[0].embedding
    
    console.log('✅ OpenAI 備用編碼成功')
    
    return {
      embedding,
      info: {
        model: 'openai-text-embedding-3-small',
        type: 'text',
        inputLength: text.length,
        fallback: true,
        dimensions: embedding.length
      }
    }
  } catch (error) {
    console.error('❌ OpenAI 備用編碼也失敗:', error)
    throw new Error('所有文字編碼方法都失敗了')
  }
}

// 🎭 備用方案：模擬圖像編碼
async function createMockImageEmbedding(imageData: string) {
  console.log('⚠️ 使用模擬圖像編碼')
  
  // 基於圖像數據生成確定性的嵌入向量
  const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData
  const hash = simpleHash(base64Data)
  
  // 生成 512 維的模擬嵌入向量
  const embedding = Array.from({ length: 512 }, (_, i) => {
    const seed = hash + i
    return Math.sin(seed * 0.01) * Math.cos(seed * 0.02)
  })
  
  return {
    embedding,
    info: {
      model: 'mock-image-embedding',
      type: 'image',
      fallback: true,
      dimensions: embedding.length,
      note: '這是模擬嵌入向量，僅供開發測試使用'
    }
  }
}

// 簡單哈希函數
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 轉換為 32 位整數
  }
  return Math.abs(hash)
}