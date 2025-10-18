import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// 資料庫連接池 (復用配置)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'stylemate_fashion',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2616',
  max: 10,
  idleTimeoutMillis: 30000,
})

// GET - 獲取單一商品詳細資料
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const productId = parseInt(params.id)
  
  if (!productId || isNaN(productId)) {
    return NextResponse.json(
      { success: false, error: '無效的商品 ID' },
      { status: 400 }
    )
  }

  try {
    const client = await pool.connect()
    
    try {
      // 獲取完整商品資料
      const productQuery = `
        SELECT 
          p.*,
          -- 變體資訊 
          COALESCE(
            json_agg(
              json_build_object(
                'id', pv.id,
                'sku', pv.sku,
                'variant_name', pv.variant_name,
                'color_name', pv.color_name,
                'color_code', pv.color_code,
                'images', pv.images,
                'thumbnail', pv.thumbnail,
                'price_override', pv.price_override,
                'status', pv.status,
                'inventory', pv_inventory.inventory_data
              ) ORDER BY pv.sort_order
            ) FILTER (WHERE pv.id IS NOT NULL),
            '[]'::json
          ) as variants,
          -- 商品詳細資訊
          pd.material_composition,
          pd.care_instructions,
          pd.fabric_thickness,
          pd.fabric_stretch,
          pd.fabric_lining,
          pd.fabric_transparency,
          pd.size_chart_image,
          pd.origin_country,
          pd.weight,
          pd.model_info,
          -- 尺寸資訊
          COALESCE(
            json_agg(
              json_build_object(
                'size', psi.size,
                'size_label', psi.size_label,
                'measurements', psi.measurements,
                'model_wear', psi.model_wear,
                'fit_notes', psi.fit_notes,
                'recommendations', psi.recommendations
              ) ORDER BY psi.sort_order
            ) FILTER (WHERE psi.size IS NOT NULL),
            '[]'::json
          ) as size_info,
          -- 總庫存
          COALESCE(SUM(pi.quantity), 0) as total_stock,
          COALESCE(SUM(pi.available_quantity), 0) as available_stock
        FROM products p
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        LEFT JOIN product_details pd ON p.id = pd.product_id
        LEFT JOIN product_size_info psi ON p.id = psi.product_id
        LEFT JOIN product_inventory pi ON pv.id = pi.variant_id AND pi.is_active = true
        LEFT JOIN (
          -- 子查詢：每個變體的庫存明細
          SELECT 
            variant_id,
            json_agg(
              json_build_object(
                'size', size,
                'quantity', quantity,
                'reserved_quantity', reserved_quantity,
                'available_quantity', available_quantity,
                'low_stock_threshold', low_stock_threshold
              ) ORDER BY size_order
            ) as inventory_data
          FROM product_inventory 
          WHERE is_active = true
          GROUP BY variant_id
        ) pv_inventory ON pv.id = pv_inventory.variant_id
        WHERE p.id = $1
        GROUP BY p.id, pd.product_id
      `
      
      const result = await client.query(productQuery, [productId])
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: '商品不存在' },
          { status: 404 }
        )
      }

      const product = result.rows[0]
      
      // 獲取商品圖片
      const imagesQuery = `
        SELECT 
          image_url,
          alt_text,
          title,
          image_type,
          sort_order
        FROM product_images 
        WHERE product_id = $1 AND is_active = true
        ORDER BY sort_order
      `
      
      const imagesResult = await client.query(imagesQuery, [productId])
      product.images = imagesResult.rows
      
      return NextResponse.json({
        success: true,
        data: product
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ 商品查詢失敗:', error)
    
    // 備援：使用靜態商品數據
    try {
      const { products } = await import('@/lib/products')
      const staticProduct = products.find(p => p.id === productId)
      
      if (staticProduct) {
        // 轉換為 API 格式
        const formattedProduct = {
          id: staticProduct.id,
          name: staticProduct.name,
          category: staticProduct.category,
          price: staticProduct.price,
          description: `${staticProduct.name} - 韓系時尚精選商品`,
          brand: 'STYLEMATE',
          material: staticProduct.material || '混紡材質',
          style: staticProduct.style || 'korean',
          status: 'active',
          images: staticProduct.images ? staticProduct.images.map((img, index) => ({
            image_url: img.startsWith('/') ? img : `/images/products/${img}`,
            alt_text: staticProduct.name,
            title: staticProduct.name,
            image_type: 'main',
            sort_order: index
          })) : [],
          variants: [],
          size_info: [],
          total_stock: 50,
          available_stock: 50
        }
        
        return NextResponse.json({
          success: true,
          data: formattedProduct,
          fallback: true
        })
      }
    } catch (importError) {
      console.error('❌ 靜態商品數據載入失敗:', importError)
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: '商品不存在',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 404 }
    )
  }
}

// PUT - 更新商品
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const productId = parseInt(params.id)
  
  if (!productId || isNaN(productId)) {
    return NextResponse.json(
      { success: false, error: '無效的商品 ID' },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    const {
      name,
      category,
      price,
      original_price,
      description,
      short_description,
      brand,
      material,
      style,
      season,
      occasion,
      tags,
      colors,
      status,
      is_featured
    } = body

    if (!name || !category || !price) {
      return NextResponse.json(
        { success: false, error: '商品名稱、分類和價格為必填欄位' },
        { status: 400 }
      )
    }

    // 備援：模擬商品更新（僅返回成功訊息，無法實際持久化）
    try {
      const { products } = await import('@/lib/products')
      const staticProduct = products.find(p => p.id === productId)
      
      if (staticProduct) {
        // 模擬更新後的商品資料
        const updatedProduct = {
          ...staticProduct,
          name: name || staticProduct.name,
          category: category || staticProduct.category,
          price: price || staticProduct.price,
          description: description || `${staticProduct.name} - 韓系時尚精選商品`,
          brand: brand || 'STYLEMATE',
          material: material || staticProduct.material || '混紡材質',
          style: style || staticProduct.style || 'korean',
          status: status || 'active',
          updated_at: new Date().toISOString()
        }
        
        return NextResponse.json({
          success: true,
          message: '商品更新成功（開發模式：僅模擬更新）',
          data: updatedProduct,
          fallback: true
        })
      } else {
        return NextResponse.json(
          { success: false, error: '商品不存在' },
          { status: 404 }
        )
      }
    } catch (importError) {
      console.error('❌ 靜態商品數據載入失敗:', importError)
      return NextResponse.json(
        { 
          success: false, 
          error: '商品更新失敗',
          details: importError instanceof Error ? importError.message : '未知錯誤'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ 商品更新失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '商品更新失敗',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
}

// DELETE - 刪除商品 (軟刪除)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const productId = parseInt(params.id)
  
  if (!productId || isNaN(productId)) {
    return NextResponse.json(
      { success: false, error: '無效的商品 ID' },
      { status: 400 }
    )
  }

  try {
    const client = await pool.connect()
    
    try {
      // 檢查商品是否存在
      const existsResult = await client.query(
        'SELECT id, status FROM products WHERE id = $1',
        [productId]
      )
      
      if (existsResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: '商品不存在' },
          { status: 404 }
        )
      }

      if (existsResult.rows[0].status === 'deleted') {
        return NextResponse.json(
          { success: false, error: '商品已被刪除' },
          { status: 400 }
        )
      }

      // 軟刪除商品 (設定狀態為 deleted)
      const deleteResult = await client.query(`
        UPDATE products 
        SET 
          status = 'deleted',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, name, status
      `, [productId])
      
      // 同時設定變體狀態
      await client.query(`
        UPDATE product_variants 
        SET status = 'deleted'
        WHERE product_id = $1
      `, [productId])
      
      return NextResponse.json({
        success: true,
        message: '商品刪除成功',
        data: deleteResult.rows[0]
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ 商品刪除失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '商品刪除失敗',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
}