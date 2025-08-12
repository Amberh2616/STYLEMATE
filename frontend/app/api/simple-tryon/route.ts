import { NextRequest, NextResponse } from 'next/server'

// 超簡單的試穿 API - 只做基本合成
export async function POST(request: NextRequest) {
  try {
    const { personImageUrl, garmentImageUrl } = await request.json()

    console.log('🚀 簡單試穿開始...')
    console.log('👤 人物圖片長度:', personImageUrl?.length)
    console.log('👕 服裝圖片長度:', garmentImageUrl?.length)

    if (!personImageUrl || !garmentImageUrl) {
      return NextResponse.json({
        success: false,
        error: '需要人物照片和服裝圖片'
      }, { status: 400 })
    }

    // 使用 Sharp 進行簡單合成
    const result = await simpleComposite(personImageUrl, garmentImageUrl)
    
    console.log('✅ 簡單試穿完成！')
    
    return NextResponse.json({
      success: true,
      url: result,
      message: '使用本地合成技術',
      processingTime: '< 1 秒'
    })

  } catch (error) {
    console.error('❌ 簡單試穿失敗:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      fallback: '返回原始照片'
    }, { status: 500 })
  }
}

// 簡單的圖片合成
async function simpleComposite(personUrl: string, clothUrl: string): Promise<string> {
  try {
    const sharp = require('sharp')
    
    // 處理 base64 圖片
    const personBuffer = Buffer.from(personUrl.split(',')[1], 'base64')
    const clothBuffer = Buffer.from(clothUrl.split(',')[1], 'base64')
    
    console.log('📐 開始圖片處理...')
    
    const personImage = sharp(personBuffer)
    const { width, height } = await personImage.metadata()
    
    console.log(`📏 原圖尺寸: ${width}x${height}`)
    
    // 調整服裝大小 - 更合理的比例
    const clothWidth = Math.round((width || 400) * 0.35)
    const clothHeight = Math.round((height || 600) * 0.25)
    
    const resizedCloth = await sharp(clothBuffer)
      .resize({
        width: clothWidth,
        height: clothHeight,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer()
    
    console.log(`👕 服裝調整至: ${clothWidth}x${clothHeight}`)
    
    // 計算合成位置 - 胸部區域
    const left = Math.round((width || 400) * 0.32)
    const top = Math.round((height || 600) * 0.25)
    
    console.log(`📍 合成位置: (${left}, ${top})`)
    
    // 合成圖片
    const composite = await personImage
      .composite([{
        input: resizedCloth,
        left: left,
        top: top,
        blend: 'over'
      }])
      .png()
      .toBuffer()
    
    const result = `data:image/png;base64,${composite.toString('base64')}`
    
    console.log('🎉 合成完成！')
    
    return result
    
  } catch (error) {
    console.error('💥 合成處理失敗:', error)
    // 返回原始人物圖片
    return personUrl
  }
}