import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// 資料庫連接池
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'stylemate_fashion',
  user: 'postgres',
  password: '2616',
  max: 10,
  idleTimeoutMillis: 30000,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get('ids')
    
    if (!idsParam) {
      return NextResponse.json(
        { success: false, error: 'Missing ids parameter' },
        { status: 400 }
      )
    }

    // 解析產品 ID 列表 - 支援字串ID (企業級架構)
    const rawIds = idsParam.split(',').map(id => id.trim()).filter(id => id.length > 0)
    
    if (rawIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid product IDs' },
        { status: 400 }
      )
    }

    // 字串ID到products.ts的映射 (向後相容)
    const stringIdMapping: Record<string, number> = {
      'dress_elegant_floral': 1,
      'dress_sweet_pink_midi': 2,
      'dress_minimalist_white_maxi': 3,
      'top_basic_white_tee': 4,
      'top_casual_striped': 5,
      'shorts_high_waisted_denim': 6,
      'top_puff_sleeve': 7,
      'top_french_romantic': 8,
      'dress_french_elegant': 9
    }

    // 處理混合ID格式：數字ID + 字串ID
    const ids: number[] = []
    for (const rawId of rawIds) {
      const numericId = parseInt(rawId)
      if (!isNaN(numericId)) {
        ids.push(numericId)
      } else if (stringIdMapping[rawId]) {
        ids.push(stringIdMapping[rawId])
      }
    }
    
    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid product IDs found' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    
    // 構建查詢，使用 ANY() 來匹配多個 ID
    const query = `
      SELECT 
        id, image_path, filename, name_zh, name_en, 
        category_zh, category_en, colors_zh, colors_en,
        style_tags_zh, style_tags_en, occasion_zh, occasion_en,
        price_twd, discount_price_twd, description_zh, description_en,
        material_guess, price_tier, ai_confidence
      FROM fashion_items 
      WHERE id = ANY($1)
      ORDER BY CASE
        ${ids.map((id, index) => `WHEN id = ${id} THEN ${index}`).join(' ')}
      END
    `
    
    const result = await client.query(query, [ids])
    client.release()

    // 格式化結果
    const fashionItems = result.rows.map((row: any) => ({
      id: row.id,
      imagePath: row.image_path,
      filename: row.filename,
      name: {
        zh: row.name_zh,
        en: row.name_en
      },
      category: {
        zh: row.category_zh,
        en: row.category_en
      },
      colors: {
        zh: row.colors_zh || [],
        en: row.colors_en || []
      },
      styleTags: {
        zh: row.style_tags_zh || [],
        en: row.style_tags_en || []
      },
      occasion: {
        zh: row.occasion_zh || [],
        en: row.occasion_en || []
      },
      price: {
        twd: row.price_twd,
        discount: row.discount_price_twd
      },
      description: {
        zh: row.description_zh,
        en: row.description_en
      },
      material: row.material_guess,
      priceTier: row.price_tier,
      confidence: row.ai_confidence
    }))

    console.log(`✅ Products API: 請求${rawIds.length}個ID，映射到${ids.length}個數字ID，找到${fashionItems.length}個商品`)
    
    return NextResponse.json({
      success: true,
      data: fashionItems,
      requestedIds: rawIds,
      mappedIds: ids,
      foundCount: fashionItems.length
    })

  } catch (error) {
    console.error('Get products by IDs error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}