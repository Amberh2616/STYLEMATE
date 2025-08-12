import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

// 測試試穿API - 使用預設圖片
export async function POST(request: NextRequest) {
  try {
    const { userPhotoBase64, clothingPhotoBase64 } = await request.json()
    
    console.log('🧪 開始去背商品試穿測試...')
    
    if (!userPhotoBase64 || !clothingPhotoBase64) {
      return NextResponse.json({
        success: false,
        error: '需要人物照片和去背商品圖片'
      }, { status: 400 })
    }

    // 處理用戶照片
    const userPhotoBuffer = Buffer.from(userPhotoBase64.split(',')[1], 'base64')
    const clothingBuffer = Buffer.from(clothingPhotoBase64.split(',')[1], 'base64')
    
    const userImage = sharp(userPhotoBuffer)
    const { width, height } = await userImage.metadata()
    
    console.log('📏 用戶照片尺寸:', `${width}×${height}`)
    console.log('👕 去背商品圖片大小:', clothingBuffer.length, 'bytes')
    
    // 第一步：識別人體區域（簡化的身體檢測）
    const bodyRegion = {
      x: Math.round((width || 400) * 0.25),      // 身體左邊界
      y: Math.round((height || 600) * 0.2),      // 上身開始
      width: Math.round((width || 400) * 0.5),   // 身體寬度
      height: Math.round((height || 600) * 0.4)   // 上身高度
    }
    
    console.log('👤 身體區域:', bodyRegion)

    // 第二步：創建身體遮罩（移除原有上衣）
    const bodyMask = await sharp({
      create: {
        width: bodyRegion.width,
        height: bodyRegion.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 180 } // 半透明白色遮罩
      }
    })
    .png()
    .toBuffer()

    // 第三步：處理新T恤，調整到身體尺寸
    const processedProduct = await sharp(clothingBuffer)
      .resize({
        width: bodyRegion.width,
        height: bodyRegion.height,
        fit: 'cover', // 使用 cover 讓T恤填滿身體區域
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer()

    // 第四步：多層合成實現真實試穿效果
    const composite = await userImage
      .composite([
        // 先蓋住原有上衣
        {
          input: bodyMask,
          left: bodyRegion.x,
          top: bodyRegion.y,
          blend: 'screen' // 使用 screen 模式淡化原有衣服
        },
        // 再放上新T恤
        {
          input: processedProduct,
          left: bodyRegion.x,
          top: bodyRegion.y,
          blend: 'over' // 正常疊加，不透明
        }
      ])
      .png()
      .toBuffer()
    
    const resultBase64 = `data:image/png;base64,${composite.toString('base64')}`
    
    console.log('✅ 去背商品試穿測試完成!')
    
    return NextResponse.json({
      success: true,
      result: {
        originalPhoto: userPhotoBase64,
        clothingPhoto: clothingPhotoBase64,
        finalResult: resultBase64,
        processingTime: Date.now(),
        method: '去背商品智能合成',
        message: '使用您上傳的去背商品圖片'
      }
    })
    
  } catch (error) {
    console.error('❌ 測試試穿失敗:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}