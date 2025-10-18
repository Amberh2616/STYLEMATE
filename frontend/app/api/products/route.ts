import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// 資料庫連接池
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'stylemate_fashion',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2616',
  max: 10,
  idleTimeoutMillis: 30000,
})

// GET - 獲取商品列表
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // 查詢參數
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const category = searchParams.get('category')
  const status = searchParams.get('status') || 'active'
  const search = searchParams.get('search')
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const sortOrder = searchParams.get('sortOrder') || 'DESC'
  
  const offset = (page - 1) * limit

  try {
    const client = await pool.connect()
    
    try {
      // 建構 WHERE 條件
      let whereConditions = ['p.status = $1']
      let queryParams = [status]
      let paramIndex = 2

      if (category) {
        whereConditions.push(`p.category = $${paramIndex}`)
        queryParams.push(category)
        paramIndex++
      }

      if (search) {
        whereConditions.push(`(
          p.name ILIKE $${paramIndex} OR 
          p.description ILIKE $${paramIndex} OR
          p.tags::text ILIKE $${paramIndex}
        )`)
        queryParams.push(`%${search}%`)
        paramIndex++
      }

      const whereClause = whereConditions.join(' AND ')
      
      // 主查詢 - 獲取商品資料與變體資訊
      const productQuery = `
        SELECT 
          p.id,
          p.name,
          p.sku,
          p.slug,
          p.category,
          p.price,
          p.original_price,
          p.description,
          p.short_description,
          p.brand,
          p.material,
          p.style,
          p.season,
          p.occasion,
          p.tags,
          p.colors,
          p.status,
          p.is_featured,
          p.created_at,
          p.updated_at,
          -- 變體資訊
          COALESCE(
            json_agg(
              json_build_object(
                'id', pv.id,
                'color_name', pv.color_name,
                'color_code', pv.color_code,
                'images', pv.images,
                'thumbnail', pv.thumbnail
              ) ORDER BY pv.sort_order
            ) FILTER (WHERE pv.id IS NOT NULL),
            '[]'::json
          ) as variants,
          -- 庫存統計
          COALESCE(SUM(pi.quantity), 0) as total_stock
        FROM products p
        LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.status = 'active'
        LEFT JOIN product_inventory pi ON pv.id = pi.variant_id AND pi.is_active = true
        WHERE ${whereClause}
        GROUP BY p.id
        ORDER BY ${sortBy === 'name' ? 'p.name' : 'p.' + sortBy} ${sortOrder}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `
      
      queryParams.push(limit, offset)
      
      const result = await client.query(productQuery, queryParams)
      
      // 總數查詢
      const countQuery = `
        SELECT COUNT(DISTINCT p.id) as total
        FROM products p
        WHERE ${whereClause}
      `
      
      const countResult = await client.query(countQuery, queryParams.slice(0, -2))
      const total = parseInt(countResult.rows[0].total)
      
      // 回傳資料
      return NextResponse.json({
        success: true,
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        filters: {
          category,
          status,
          search
        }
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ 商品列表查詢失敗:', error)
    
    // 備援：使用靜態商品數據
    try {
      const { products } = await import('@/lib/products')
      
      // 過濾邏輯
      let filteredProducts = products.filter(p => {
        if (category && p.category !== category) return false
        if (search) {
          const searchLower = search.toLowerCase()
          return p.name.toLowerCase().includes(searchLower)
        }
        return true
      })
      
      // 排序
      if (sortBy === 'name') {
        filteredProducts.sort((a, b) => {
          return sortOrder === 'DESC' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)
        })
      } else if (sortBy === 'price') {
        filteredProducts.sort((a, b) => {
          return sortOrder === 'DESC' ? b.price - a.price : a.price - b.price
        })
      }
      
      // 分頁
      const total = filteredProducts.length
      const startIndex = offset
      const endIndex = Math.min(startIndex + limit, total)
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
      
      // 轉換為 API 格式
      const formattedProducts = paginatedProducts.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        original_price: product.price,
        description: `${product.name} - 韓系時尚精選商品`,
        brand: 'STYLEMATE',
        material: product.material || '混紡材質',
        style: product.style || 'korean',
        status: 'active',
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        variants: [{
          id: product.id,
          color_name: product.colors?.[0] || '預設',
          thumbnail: product.image
        }],
        total_stock: 50
      }))
      
      return NextResponse.json({
        success: true,
        data: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        filters: {
          category,
          status,
          search
        },
        fallback: true
      })
      
    } catch (importError) {
      console.error('❌ 靜態商品數據載入失敗:', importError)
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: '商品查詢失敗',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
}

// POST - 新增商品
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 基本資料驗證
    const {
      name,
      category,
      price,
      description,
      brand = 'STYLEMATE',
      material,
      style,
      season = [],
      occasion = [],
      tags = [],
      colors = [],
      variants = []
    } = body

    if (!name || !category || !price) {
      return NextResponse.json(
        { success: false, error: '商品名稱、分類和價格為必填欄位' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')
      
      // 生成 SKU 和 slug
      const categoryCode = category.toUpperCase()
      const timestamp = Date.now().toString().slice(-6)
      const sku = `STM-${categoryCode}-${timestamp}`
      const slug = name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')
      
      // 插入商品主資料
      const productResult = await client.query(`
        INSERT INTO products (
          name, sku, slug, category, price, description,
          brand, material, style, season, occasion, tags, colors,
          status, is_featured, sort_order
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        ) RETURNING id
      `, [
        name, sku, slug, category, price, description,
        brand, material, style,
        JSON.stringify(season),
        JSON.stringify(occasion), 
        JSON.stringify(tags),
        JSON.stringify(colors),
        'active',
        false,
        0
      ])
      
      const productId = productResult.rows[0].id
      
      // 如果有變體資料，插入變體
      if (variants.length > 0) {
        for (let i = 0; i < variants.length; i++) {
          const variant = variants[i]
          
          const variantSku = `${sku}-${variant.color_name?.substring(0, 2) || 'DEF'}`
          
          const variantResult = await client.query(`
            INSERT INTO product_variants (
              product_id, sku, variant_name, color_name, color_code,
              images, thumbnail, status, sort_order
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9
            ) RETURNING id
          `, [
            productId,
            variantSku,
            `${name} - ${variant.color_name || '預設'}`,
            variant.color_name || '預設',
            variant.color_code || '#808080',
            JSON.stringify(variant.images || []),
            variant.thumbnail || '',
            'active',
            i + 1
          ])
          
          // 為變體創建庫存記錄 (標準尺寸)
          const variantId = variantResult.rows[0].id
          const standardSizes = ['S', 'M', 'L']
          
          for (let j = 0; j < standardSizes.length; j++) {
            await client.query(`
              INSERT INTO product_inventory (
                variant_id, size, quantity, size_order, low_stock_threshold
              ) VALUES ($1, $2, $3, $4, $5)
            `, [
              variantId,
              standardSizes[j],
              variant.stock?.[standardSizes[j]] || 0,
              j + 1,
              5
            ])
          }
        }
      }
      
      await client.query('COMMIT')
      
      // 回傳新建的商品資料
      const newProduct = await client.query(`
        SELECT p.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', pv.id,
                'color_name', pv.color_name,
                'color_code', pv.color_code,
                'images', pv.images
              )
            ) FILTER (WHERE pv.id IS NOT NULL),
            '[]'::json
          ) as variants
        FROM products p
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        WHERE p.id = $1
        GROUP BY p.id
      `, [productId])
      
      return NextResponse.json({
        success: true,
        message: '商品新增成功',
        data: newProduct.rows[0]
      }, { status: 201 })
      
    } catch (dbError) {
      await client.query('ROLLBACK')
      throw dbError
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ 商品新增失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '商品新增失敗',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
}