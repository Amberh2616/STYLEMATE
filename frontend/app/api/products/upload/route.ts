import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'stylemate_fashion',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2616',
  max: 10,
  idleTimeoutMillis: 30000,
})

// 允許的圖片格式
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// POST - 上傳商品圖片
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const productId = formData.get('productId') as string
    const variantId = formData.get('variantId') as string
    const imageType = formData.get('imageType') as string || 'main'
    const altText = formData.get('altText') as string
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: '請選擇要上傳的圖片' },
        { status: 400 }
      )
    }

    // 檢查檔案類型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: '不支援的圖片格式，請上傳 JPG、PNG 或 WebP 格式' },
        { status: 400 }
      )
    }

    // 檢查檔案大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: '圖片檔案過大，請上傳小於 5MB 的圖片' },
        { status: 400 }
      )
    }

    // 生成唯一檔名
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const extension = path.extname(file.name)
    const fileName = `${timestamp}_${randomStr}${extension}`
    
    // 確定儲存路徑
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products')
    const filePath = path.join(uploadDir, fileName)
    const webPath = `/images/products/${fileName}`

    try {
      // 確保目錄存在
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      // 儲存檔案
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // 儲存到資料庫
      const client = await pool.connect()
      
      try {
        const imageResult = await client.query(`
          INSERT INTO product_images (
            product_id, variant_id, image_url, alt_text, title,
            image_type, width, height, file_size, format,
            sort_order, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *
        `, [
          productId ? parseInt(productId) : null,
          variantId ? parseInt(variantId) : null,
          webPath,
          altText || file.name,
          altText || file.name,
          imageType,
          null, // width - 需要圖片處理庫來獲取
          null, // height
          file.size,
          extension.substring(1), // 移除點號
          0, // 預設排序
          true
        ])

        // 如果是主圖，更新變體的縮圖
        if (imageType === 'main' && variantId) {
          await client.query(`
            UPDATE product_variants 
            SET thumbnail = $1
            WHERE id = $2
          `, [webPath, parseInt(variantId)])
        }

        return NextResponse.json({
          success: true,
          message: '圖片上傳成功',
          data: {
            id: imageResult.rows[0].id,
            url: webPath,
            fileName,
            size: file.size,
            type: file.type
          }
        })
        
      } finally {
        client.release()
      }

    } catch (saveError) {
      console.error('❌ 圖片儲存失敗:', saveError)
      return NextResponse.json(
        { success: false, error: '圖片儲存失敗' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('❌ 圖片上傳失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '圖片上傳失敗',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
}

// DELETE - 刪除圖片
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('id')
    
    if (!imageId) {
      return NextResponse.json(
        { success: false, error: '請提供圖片 ID' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    
    try {
      // 獲取圖片資訊
      const imageResult = await client.query(
        'SELECT * FROM product_images WHERE id = $1',
        [parseInt(imageId)]
      )
      
      if (imageResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: '圖片不存在' },
          { status: 404 }
        )
      }

      const imageData = imageResult.rows[0]
      
      // 軟刪除圖片記錄
      await client.query(`
        UPDATE product_images 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [parseInt(imageId)])
      
      // TODO: 實際刪除檔案 (可選，也可以保留檔案作為備份)
      // const fullPath = path.join(process.cwd(), 'public', imageData.image_url)
      // if (existsSync(fullPath)) {
      //   await unlink(fullPath)
      // }
      
      return NextResponse.json({
        success: true,
        message: '圖片刪除成功',
        data: { id: imageId, url: imageData.image_url }
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ 圖片刪除失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '圖片刪除失敗',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
}