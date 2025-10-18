import { NextRequest, NextResponse } from 'next/server'
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

// GET - 獲取商品分類列表
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const includeStats = searchParams.get('stats') === 'true'

  try {
    const client = await pool.connect()
    
    try {
      let query = `
        SELECT 
          pc.id,
          pc.name,
          pc.slug,
          pc.description,
          pc.image,
          pc.icon,
          pc.sort_order,
          pc.is_active
      `
      
      if (includeStats) {
        query += `,
          COUNT(DISTINCT p.id) as product_count,
          COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_products
        `
      }
      
      query += `
        FROM product_categories pc
      `
      
      if (includeStats) {
        query += `
          LEFT JOIN products p ON pc.name = p.category
        `
      }
      
      query += `
        WHERE pc.is_active = true
      `
      
      if (includeStats) {
        query += `GROUP BY pc.id`
      }
      
      query += ` ORDER BY pc.sort_order, pc.name`
      
      const result = await client.query(query)
      
      return NextResponse.json({
        success: true,
        data: result.rows
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ 分類查詢失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '分類查詢失敗',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
}

// POST - 新增分類
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      image,
      icon,
      sort_order = 0
    } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: '分類名稱為必填欄位' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    
    try {
      // 生成 slug
      const slug = name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')
      
      // 檢查分類是否已存在
      const existsResult = await client.query(
        'SELECT id FROM product_categories WHERE name = $1 OR slug = $2',
        [name, slug]
      )
      
      if (existsResult.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: '分類名稱已存在' },
          { status: 400 }
        )
      }

      // 插入新分類
      const result = await client.query(`
        INSERT INTO product_categories (
          name, slug, description, image, icon, sort_order, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        name, slug, description, image, icon, sort_order, true
      ])
      
      return NextResponse.json({
        success: true,
        message: '分類新增成功',
        data: result.rows[0]
      }, { status: 201 })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ 分類新增失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '分類新增失敗',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
}