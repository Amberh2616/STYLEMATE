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
    const category = searchParams.get('category')
    const color = searchParams.get('color')
    const priceRange = searchParams.get('priceRange')
    const style = searchParams.get('style')
    const occasion = searchParams.get('occasion')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = `
      SELECT 
        id, image_path, filename, name_zh, name_en, 
        category_zh, category_en, colors_zh, colors_en,
        style_tags_zh, style_tags_en, occasion_zh, occasion_en,
        price_twd, discount_price_twd, description_zh, description_en,
        material_guess, price_tier, ai_confidence
      FROM fashion_items 
      WHERE 1=1
    `
    
    const queryParams: any[] = []
    let paramCount = 0

    // 分類篩選
    if (category) {
      paramCount++
      query += ` AND (category_zh = $${paramCount} OR category_en = $${paramCount})`
      queryParams.push(category)
    }

    // 顏色篩選
    if (color) {
      paramCount++
      query += ` AND (colors_zh::text LIKE $${paramCount} OR colors_en::text LIKE $${paramCount})`
      queryParams.push(`%${color}%`)
    }

    // 風格篩選
    if (style) {
      paramCount++
      query += ` AND (style_tags_zh::text LIKE $${paramCount} OR style_tags_en::text LIKE $${paramCount})`
      queryParams.push(`%${style}%`)
    }

    // 場合篩選
    if (occasion) {
      paramCount++
      query += ` AND (occasion_zh::text LIKE $${paramCount} OR occasion_en::text LIKE $${paramCount})`
      queryParams.push(`%${occasion}%`)
    }

    // 價格範圍篩選
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split('-').map(Number)
      if (minPrice && maxPrice) {
        paramCount++
        query += ` AND price_twd BETWEEN $${paramCount} AND $${paramCount + 1}`
        queryParams.push(minPrice, maxPrice)
        paramCount++
      }
    }

    // 排序和分頁
    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    queryParams.push(limit, offset)

    const client = await pool.connect()
    const result = await client.query(query, queryParams)
    
    // 獲取總數（用於分頁）
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM').replace(/ORDER BY.*/, '')
    const countResult = await client.query(countQuery, queryParams.slice(0, -2))
    const totalCount = parseInt(countResult.rows[0].count)
    
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

    return NextResponse.json({
      success: true,
      data: fashionItems,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error('Fashion search error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, filters } = body

    // 文字搜尋功能
    let searchQuery = `
      SELECT 
        id, image_path, filename, name_zh, name_en, 
        category_zh, category_en, colors_zh, colors_en,
        style_tags_zh, style_tags_en, occasion_zh, occasion_en,
        price_twd, discount_price_twd, description_zh, description_en,
        material_guess, price_tier, ai_confidence
      FROM fashion_items 
      WHERE (
        name_zh ILIKE $1 OR name_en ILIKE $1 OR 
        description_zh ILIKE $1 OR description_en ILIKE $1 OR
        style_tags_zh::text ILIKE $1 OR style_tags_en::text ILIKE $1
      )
    `
    
    const queryParams = [`%${query}%`]
    let paramCount = 1

    // 應用篩選條件
    if (filters?.category) {
      paramCount++
      searchQuery += ` AND (category_zh = $${paramCount} OR category_en = $${paramCount})`
      queryParams.push(filters.category)
    }

    if (filters?.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange
      paramCount++
      searchQuery += ` AND price_twd BETWEEN $${paramCount} AND $${paramCount + 1}`
      queryParams.push(minPrice, maxPrice)
      paramCount++
    }

    searchQuery += ` ORDER BY created_at DESC LIMIT 20`

    const client = await pool.connect()
    const result = await client.query(searchQuery, queryParams)
    client.release()

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

    return NextResponse.json({
      success: true,
      query,
      data: fashionItems,
      count: fashionItems.length
    })

  } catch (error) {
    console.error('Fashion text search error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Text search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}