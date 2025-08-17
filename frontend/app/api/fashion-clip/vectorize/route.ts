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

export async function POST(request: NextRequest) {
  try {
    const { action = 'vectorize_all', productIds, batchSize = 5 } = await request.json()

    console.log('🚀 Fashion-CLIP 向量化請求:', { action, productIds, batchSize })

    let result: any

    switch (action) {
      case 'vectorize_all':
        result = await vectorizeAllProducts(batchSize)
        break
      case 'vectorize_products':
        if (!productIds || !Array.isArray(productIds)) {
          return NextResponse.json({
            success: false,
            error: '需要提供商品 ID 陣列'
          }, { status: 400 })
        }
        result = await vectorizeSpecificProducts(productIds)
        break
      case 'setup_database':
        result = await setupVectorDatabase()
        break
      default:
        return NextResponse.json({
          success: false,
          error: '無效的操作類型'
        }, { status: 400 })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ 向量化處理錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '向量化處理失敗'
    }, { status: 500 })
  }
}

// 🗄️ 設置向量資料庫
async function setupVectorDatabase() {
  const client = await pool.connect()
  
  try {
    console.log('📋 正在設置向量資料庫...')

    // 檢查是否安裝了 pgvector 擴展
    await client.query('CREATE EXTENSION IF NOT EXISTS vector;')
    
    // 檢查嵌入向量欄位是否存在
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'fashion_items' 
      AND column_name = 'embedding_vector'
    `)

    if (checkColumn.rows.length === 0) {
      // 添加嵌入向量欄位 (512 維度，適合 Fashion-CLIP)
      await client.query(`
        ALTER TABLE fashion_items 
        ADD COLUMN embedding_vector vector(512);
      `)
      console.log('✅ 已添加 embedding_vector 欄位')
    }

    // 創建向量索引以提升搜尋性能
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS fashion_items_embedding_vector_idx 
        ON fashion_items 
        USING ivfflat (embedding_vector vector_cosine_ops)
        WITH (lists = 100);
      `)
      console.log('✅ 已創建向量索引')
    } catch (indexError) {
      console.log('⚠️ 向量索引創建跳過 (可能需要更多數據)')
    }

    // 添加更新時間欄位
    const checkUpdateColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'fashion_items' 
      AND column_name = 'embedding_updated_at'
    `)

    if (checkUpdateColumn.rows.length === 0) {
      await client.query(`
        ALTER TABLE fashion_items 
        ADD COLUMN embedding_updated_at TIMESTAMP;
      `)
      console.log('✅ 已添加 embedding_updated_at 欄位')
    }

    return {
      success: true,
      message: '向量資料庫設置完成',
      actions: [
        '已安裝 pgvector 擴展',
        '已添加 embedding_vector 欄位 (512 維度)',
        '已創建向量索引',
        '已添加更新時間欄位'
      ]
    }

  } catch (error) {
    console.error('❌ 向量資料庫設置失敗:', error)
    throw new Error(`資料庫設置失敗: ${error.message}`)
  } finally {
    client.release()
  }
}

// 🎯 向量化所有商品
async function vectorizeAllProducts(batchSize: number) {
  const client = await pool.connect()
  
  try {
    // 獲取未向量化的商品
    const unvectorizedQuery = `
      SELECT id, name_zh, name_en, description_zh, description_en,
             category_zh, style_tags_zh, colors_zh
      FROM fashion_items 
      WHERE embedding_vector IS NULL 
      ORDER BY id
      LIMIT 50
    `
    
    const result = await client.query(unvectorizedQuery)
    const products = result.rows

    if (products.length === 0) {
      return {
        success: true,
        message: '所有商品都已向量化',
        processed: 0,
        total: 0
      }
    }

    console.log(`📦 開始向量化 ${products.length} 個商品...`)

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    // 分批處理
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      console.log(`🔄 處理批次 ${Math.floor(i / batchSize) + 1}: ${batch.length} 個商品`)

      for (const product of batch) {
        try {
          await vectorizeProduct(client, product)
          successCount++
          console.log(`✅ 商品 ${product.id} 向量化成功`)
        } catch (error) {
          errorCount++
          const errorMsg = `商品 ${product.id}: ${error.message}`
          errors.push(errorMsg)
          console.error(`❌ ${errorMsg}`)
        }
      }

      // 批次間稍作停顿，避免 API 限流
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return {
      success: true,
      message: `向量化完成: ${successCount} 成功, ${errorCount} 失敗`,
      processed: successCount,
      errors: errorCount,
      errorDetails: errors.slice(0, 10), // 只返回前10個錯誤
      total: products.length
    }

  } finally {
    client.release()
  }
}

// 🎯 向量化特定商品
async function vectorizeSpecificProducts(productIds: number[]) {
  const client = await pool.connect()
  
  try {
    const query = `
      SELECT id, name_zh, name_en, description_zh, description_en,
             category_zh, style_tags_zh, colors_zh
      FROM fashion_items 
      WHERE id = ANY($1::int[])
    `
    
    const result = await client.query(query, [productIds])
    const products = result.rows

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const product of products) {
      try {
        await vectorizeProduct(client, product)
        successCount++
        console.log(`✅ 商品 ${product.id} 向量化成功`)
      } catch (error) {
        errorCount++
        const errorMsg = `商品 ${product.id}: ${error.message}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }

    return {
      success: true,
      message: `指定商品向量化完成: ${successCount} 成功, ${errorCount} 失敗`,
      processed: successCount,
      errors: errorCount,
      errorDetails: errors,
      total: products.length
    }

  } finally {
    client.release()
  }
}

// 🔧 向量化單個商品
async function vectorizeProduct(client: any, product: any) {
  // 構建商品的文字描述
  const textParts = [
    product.name_zh || product.name_en,
    product.category_zh,
    product.description_zh || product.description_en,
    Array.isArray(product.style_tags_zh) ? product.style_tags_zh.join(' ') : '',
    Array.isArray(product.colors_zh) ? product.colors_zh.join(' ') : ''
  ].filter(Boolean)

  const productText = textParts.join(' ')

  if (!productText.trim()) {
    throw new Error('商品缺少可向量化的文字內容')
  }

  // 調用編碼 API
  const response = await fetch('http://localhost:3004/api/fashion-clip/encode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: productText,
      type: 'text'
    }),
  })

  const encodingResult = await response.json()

  if (!encodingResult.success) {
    throw new Error(`編碼失敗: ${encodingResult.error}`)
  }

  // 保存嵌入向量到資料庫
  const vectorString = `[${encodingResult.embedding.join(',')}]`
  
  await client.query(`
    UPDATE fashion_items 
    SET embedding_vector = $1::vector,
        embedding_updated_at = NOW()
    WHERE id = $2
  `, [vectorString, product.id])
}

// GET 端點：獲取向量化狀態
export async function GET() {
  try {
    const client = await pool.connect()
    
    const statusQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(embedding_vector) as vectorized,
        COUNT(*) - COUNT(embedding_vector) as pending,
        MAX(embedding_updated_at) as last_update
      FROM fashion_items
    `
    
    const result = await client.query(statusQuery)
    client.release()
    
    const status = result.rows[0]
    
    return NextResponse.json({
      success: true,
      status: {
        total: parseInt(status.total),
        vectorized: parseInt(status.vectorized),
        pending: parseInt(status.pending),
        lastUpdate: status.last_update,
        progress: status.total > 0 ? 
          Math.round((status.vectorized / status.total) * 100) : 0
      }
    })
  } catch (error) {
    console.error('❌ 獲取向量化狀態失敗:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}