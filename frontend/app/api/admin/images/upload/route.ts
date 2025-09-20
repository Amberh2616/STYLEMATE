import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// 支援的圖片格式
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const category = formData.get('category') as string || 'general'
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: '請選擇要上傳的圖片' },
        { status: 400 }
      )
    }

    const uploadResults = []
    const errors = []

    for (const file of files) {
      try {
        // 驗證檔案類型
        if (!ALLOWED_TYPES.includes(file.type)) {
          errors.push(`${file.name}: 不支援的檔案格式`)
          continue
        }

        // 驗證檔案大小
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name}: 檔案大小超過5MB限制`)
          continue
        }

        // 生成唯一檔名
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(7)
        const extension = file.name.split('.').pop()
        const fileName = `${timestamp}_${randomString}.${extension}`

        // 確保上傳目錄存在
        const uploadDir = join(process.cwd(), 'frontend', 'public', 'images', 'products', category)
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true })
        }

        // 保存檔案
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filePath = join(uploadDir, fileName)
        await writeFile(filePath, buffer)

        // 生成Web路徑
        const webPath = `/images/products/${category}/${fileName}`

        uploadResults.push({
          originalName: file.name,
          fileName,
          path: webPath,
          size: file.size,
          type: file.type,
          category
        })

      } catch (error) {
        console.error(`上傳 ${file.name} 失敗:`, error)
        errors.push(`${file.name}: 上傳失敗`)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        uploaded: uploadResults,
        errors,
        totalUploaded: uploadResults.length,
        totalErrors: errors.length
      }
    })

  } catch (error) {
    console.error('圖片上傳失敗:', error)
    return NextResponse.json(
      { success: false, error: '圖片上傳失敗' },
      { status: 500 }
    )
  }
}

// 獲取圖片分類列表
export async function GET() {
  try {
    const categories = [
      { id: 'dress', name: '洋裝', description: '各式洋裝' },
      { id: 'top', name: '上衣', description: '襯衫、T恤、毛衣等' },
      { id: 'bottom', name: '下裝', description: '褲子、裙子等' },
      { id: 'two-piece', name: '套裝', description: '兩件式套裝' },
      { id: 'outerwear', name: '外套', description: '夾克、大衣等' },
      { id: 'accessories', name: '配件', description: '包包、鞋子、飾品' },
      { id: 'general', name: '其他', description: '其他類型商品' }
    ]

    return NextResponse.json({
      success: true,
      data: { categories }
    })

  } catch (error) {
    console.error('獲取分類失敗:', error)
    return NextResponse.json(
      { success: false, error: '獲取分類失敗' },
      { status: 500 }
    )
  }
}

// 刪除圖片
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imagePath = searchParams.get('path')
    
    if (!imagePath) {
      return NextResponse.json(
        { success: false, error: '請提供圖片路徑' },
        { status: 400 }
      )
    }

    // 檢查是否有商品正在使用此圖片
    const { products } = await import('@/lib/products')
    const isInUse = products.some(product => product.image === imagePath)
    
    if (isInUse) {
      return NextResponse.json(
        { success: false, error: '此圖片正被商品使用，無法刪除' },
        { status: 409 }
      )
    }

    // TODO: 實際刪除檔案
    // const fullPath = join(process.cwd(), 'frontend', 'public', imagePath)
    // await unlink(fullPath)

    return NextResponse.json({
      success: true,
      message: '圖片已刪除'
    })

  } catch (error) {
    console.error('刪除圖片失敗:', error)
    return NextResponse.json(
      { success: false, error: '刪除圖片失敗' },
      { status: 500 }
    )
  }
}