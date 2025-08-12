import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

// 🧪 實驗性 AI 試穿 API
export async function POST(request: NextRequest) {
  try {
    const { userPhotoBase64, productId } = await request.json()
    
    console.log('🚀 開始 AI 試穿實驗...')
    console.log('📷 用戶照片大小:', userPhotoBase64?.length)
    console.log('👕 商品 ID:', productId)
    
    if (!userPhotoBase64 || !productId) {
      return NextResponse.json({
        success: false,
        error: '需要用戶照片和商品ID'
      }, { status: 400 })
    }
    
    // 🔍 步驟 1: 模擬 AI 姿態檢測
    const poseAnalysis = await mockPoseDetection(userPhotoBase64)
    console.log('🤖 姿態檢測結果:', poseAnalysis)
    
    // 📏 步驟 2: 身體測量
    const bodyMeasurements = calculateBodyMeasurements(poseAnalysis)
    console.log('📏 身體測量:', bodyMeasurements)
    
    // 👕 步驟 3: 載入並調整商品
    const productData = await loadAndAdaptProduct(productId, bodyMeasurements)
    console.log('👕 商品適應:', productData.adaptations)
    
    // 🎨 步驟 4: 智能合成
    const compositeResult = await experimentalComposite({
      userPhoto: userPhotoBase64,
      adaptedProduct: productData,
      bodyData: bodyMeasurements
    })
    
    return NextResponse.json({
      success: true,
      result: {
        originalPhoto: userPhotoBase64,
        finalResult: compositeResult.base64,
        processingTime: compositeResult.processingTime,
        analysis: {
          pose: poseAnalysis,
          body: bodyMeasurements,
          adaptations: productData.adaptations
        },
        confidence: compositeResult.confidence
      }
    })
    
  } catch (error) {
    console.error('❌ AI 試穿實驗失敗:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

// 🤖 模擬姿態檢測 (先用簡單版本測試)
async function mockPoseDetection(photoBase64: string): Promise<any> {
  // TODO: 這裡將來替換成真正的 AI 姿態檢測
  
  // 📷 獲取圖片尺寸
  const imageBuffer = Buffer.from(photoBase64.split(',')[1], 'base64')
  const metadata = await sharp(imageBuffer).metadata()
  
  const width = metadata.width || 400
  const height = metadata.height || 600
  
  // 🎯 假設標準人體比例 (測試用)
  const mockKeypoints = [
    { name: 'nose', x: width * 0.5, y: height * 0.15, confidence: 0.9 },
    { name: 'left_shoulder', x: width * 0.4, y: height * 0.25, confidence: 0.85 },
    { name: 'right_shoulder', x: width * 0.6, y: height * 0.25, confidence: 0.87 },
    { name: 'left_elbow', x: width * 0.35, y: height * 0.4, confidence: 0.8 },
    { name: 'right_elbow', x: width * 0.65, y: height * 0.4, confidence: 0.82 },
    { name: 'left_hip', x: width * 0.45, y: height * 0.6, confidence: 0.75 },
    { name: 'right_hip', x: width * 0.55, y: height * 0.6, confidence: 0.78 }
  ]
  
  return {
    keypoints: mockKeypoints,
    imageSize: { width, height },
    confidence: 0.83,
    detectionTime: Math.random() * 1000 + 500 // 0.5-1.5秒
  }
}

// 📏 計算身體測量
function calculateBodyMeasurements(poseData: any) {
  const { keypoints, imageSize } = poseData
  
  const leftShoulder = keypoints.find((p: any) => p.name === 'left_shoulder')
  const rightShoulder = keypoints.find((p: any) => p.name === 'right_shoulder')
  const leftHip = keypoints.find((p: any) => p.name === 'left_hip')
  const rightHip = keypoints.find((p: any) => p.name === 'right_hip')
  
  // 📊 計算關鍵測量
  const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x)
  const hipWidth = Math.abs(rightHip.x - leftHip.x)
  const torsoHeight = Math.abs((leftHip.y + rightHip.y) / 2 - (leftShoulder.y + rightShoulder.y) / 2)
  
  const shoulderCenter = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2
  }
  
  return {
    shoulderWidth,
    hipWidth,
    torsoHeight,
    shoulderCenter,
    bodyRatio: shoulderWidth / hipWidth,
    imageSize,
    confidence: 0.85
  }
}

// 👕 載入和適應商品
async function loadAndAdaptProduct(productId: string, bodyData: any) {
  const productPath = path.join(process.cwd(), 'public', 'images', 'products', `${productId}.jpg`)
  
  if (!fs.existsSync(productPath)) {
    throw new Error(`商品圖片不存在: ${productId}`)
  }
  
  // 📏 根據身體測量調整衣服
  const clothingScale = Math.max(0.8, Math.min(1.5, bodyData.shoulderWidth / 150)) // 假設標準肩寬 150px
  
  const adaptations = {
    scale: clothingScale,
    position: {
      x: bodyData.shoulderCenter.x,
      y: bodyData.shoulderCenter.y,
    },
    rotation: 0, // 暫時不旋轉
    opacity: 0.9
  }
  
  return {
    productPath,
    adaptations,
    originalSize: await sharp(productPath).metadata()
  }
}

// 🎨 實驗性合成
async function experimentalComposite(params: any) {
  const startTime = Date.now()
  
  try {
    const { userPhoto, adaptedProduct, bodyData } = params
    
    // 📷 處理用戶照片
    const userPhotoBuffer = Buffer.from(userPhoto.split(',')[1], 'base64')
    const userImage = sharp(userPhotoBuffer)
    
    // 👕 處理商品圖片
    const productImage = sharp(adaptedProduct.productPath)
    
    // 🔧 調整商品尺寸和位置 - 修正版本
    // 修正：衣服應該是合理的尺寸，不是整張照片的尺寸
    const targetWidth = Math.round(bodyData.shoulderWidth * 1.2) // 比肩膀稍微寬一點
    const targetHeight = Math.round(targetWidth * 1.3) // 上衣的合理高寬比
    
    console.log('🔧 衣服調整：', `${targetWidth}x${targetHeight}`)
    
    const scaledProduct = await productImage
      .resize({
        width: targetWidth,
        height: targetHeight,
        fit: 'cover', // 改為 cover，讓衣服填滿框架
        background: { r: 255, g: 255, b: 255, alpha: 0.8 } // 半透明白色背景
      })
      .png({ 
        quality: 90,
        compressionLevel: 6,
        force: true
      })
      .toBuffer()
    
    // 🎨 合成圖片 - 修正版本
    const clothingWidth = targetWidth  // 使用新的正確尺寸
    const clothingHeight = targetHeight
    
    // 計算更準確的位置 - 衣服中心對齊肩膀中心
    const leftPosition = Math.round(adaptedProduct.adaptations.position.x - clothingWidth / 2)
    const topPosition = Math.round(adaptedProduct.adaptations.position.y - clothingHeight / 4) // 衣服稍微往上
    
    console.log('🎨 合成參數:')
    console.log('  衣服尺寸:', clothingWidth, 'x', clothingHeight)
    console.log('  放置位置:', leftPosition, ',', topPosition)
    console.log('  肩膀中心:', adaptedProduct.adaptations.position)
    
    const compositeResult = await userImage
      .composite([{
        input: scaledProduct,
        left: leftPosition,
        top: topPosition,
        blend: 'multiply'  // 改用 multiply 模式，讓衣服更自然融合
      }])
      .png({ 
        quality: 95,
        compressionLevel: 6,
        force: true
      })
      .toBuffer()
    
    const processingTime = Date.now() - startTime
    
    return {
      base64: `data:image/png;base64,${compositeResult.toString('base64')}`,
      processingTime,
      confidence: 0.8
    }
    
  } catch (error) {
    console.error('合成錯誤:', error)
    throw new Error(`圖片合成失敗: ${error.message}`)
  }
}