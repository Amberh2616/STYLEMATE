import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

export async function POST(request: NextRequest) {
  try {
    const { userPhotoBase64, productId, category } = await request.json()

    if (!userPhotoBase64 || !productId) {
      return NextResponse.json(
        { success: false, message: '缺少必要參數' },
        { status: 400 }
      )
    }

    // 1. 處理用戶照片
    const userPhotoBuffer = Buffer.from(userPhotoBase64.split(',')[1], 'base64')
    
    // 2. 載入商品圖片
    const productImagePath = path.join(process.cwd(), 'public', 'images', 'products', `${productId}.jpg`)
    
    if (!fs.existsSync(productImagePath)) {
      return NextResponse.json(
        { success: false, message: '商品圖片不存在' },
        { status: 404 }
      )
    }

    // 3. 使用 Sharp 進行圖片合成
    const overlayPosition = getOverlayPosition(category)
    
    const compositeImage = await sharp(userPhotoBuffer)
      .resize(800, 1200, { fit: 'contain', background: '#ffffff' })
      .composite([
        {
          input: productImagePath,
          top: overlayPosition.top,
          left: overlayPosition.left,
          blend: 'multiply' // 混合模式
        }
      ])
      .png()
      .toBuffer()

    // 4. 轉換為 base64 返回
    const resultBase64 = `data:image/png;base64,${compositeImage.toString('base64')}`

    return NextResponse.json({
      success: true,
      resultImage: resultBase64,
      method: 'simple_overlay'
    })

  } catch (error) {
    console.error('簡單試穿合成錯誤:', error)
    return NextResponse.json(
      { success: false, message: '圖片合成失敗' },
      { status: 500 }
    )
  }
}

// 根據商品類型決定疊加位置
function getOverlayPosition(category: string) {
  const positions = {
    dress: { top: 200, left: 150 },
    top: { top: 250, left: 180 },
    skirt: { top: 500, left: 160 },
    set: { top: 220, left: 140 }
  }
  
  return positions[category as keyof typeof positions] || positions.dress
}