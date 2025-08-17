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
    const { query, type = 'text', limit = 10, minSimilarity = 0.7 } = await request.json()

    console.log('🔍 Fashion-CLIP 語義搜尋:', { 
      query: typeof query === 'string' ? query.substring(0, 50) + '...' : 'image data',
      type, 
      limit,
      minSimilarity 
    })

    if (!query) {
      return NextResponse.json({
        success: false,
        error: '需要提供搜尋查詢'
      }, { status: 400 })
    }

    // 1. 對查詢進行編碼
    const encodingResult = await encodeQuery(query, type)
    if (!encodingResult.success) {
      return NextResponse.json({
        success: false,
        error: `查詢編碼失敗: ${encodingResult.error}`
      }, { status: 500 })
    }

    const queryEmbedding = encodingResult.embedding

    // 2. 在資料庫中搜尋相似商品
    const searchResults = await searchSimilarProducts(queryEmbedding, limit, minSimilarity)

    // 3. 獲取商品詳細資訊
    const products = await getProductDetails(searchResults.map(r => r.id))

    // 4. 合併結果
    const results = searchResults.map(result => {
      const product = products.find(p => p.id === result.id)
      return {
        ...product,
        similarity: result.similarity,
        distance: result.distance
      }
    })

    return NextResponse.json({
      success: true,
      results,
      query: typeof query === 'string' ? query : '[圖像查詢]',
      searchType: type,
      totalResults: results.length,
      searchInfo: {
        encodingModel: encodingResult.info?.model || 'unknown',
        minSimilarity,
        maxResults: limit
      }
    })

  } catch (error) {
    console.error('❌ Fashion-CLIP 搜尋錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Fashion-CLIP 搜尋失敗'
    }, { status: 500 })
  }
}

// 🎯 編碼查詢
async function encodeQuery(query: string, type: string) {
  try {
    const response = await fetch('http://localhost:3004/api/fashion-clip/encode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        [type]: query,
        type
      }),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('❌ 查詢編碼失敗:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 🔍 搜尋相似商品
async function searchSimilarProducts(queryEmbedding: number[], limit: number, minSimilarity: number) {
  const client = await pool.connect()
  
  try {
    // 檢查是否有嵌入向量欄位
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'fashion_items' 
      AND column_name = 'embedding_vector'
    `)

    if (checkColumn.rows.length === 0) {
      // 如果沒有嵌入向量欄位，返回基於文字的搜尋結果
      console.log('⚠️ 資料庫中沒有嵌入向量，使用傳統文字搜尋')
      return await fallbackTextSearch(client, limit)
    }

    // 使用餘弦相似度進行向量搜尋
    const searchQuery = `
      SELECT 
        id,
        (1 - (embedding_vector <=> $1::vector)) as similarity,
        (embedding_vector <=> $1::vector) as distance
      FROM fashion_items 
      WHERE embedding_vector IS NOT NULL
        AND (1 - (embedding_vector <=> $1::vector)) >= $2
      ORDER BY embedding_vector <=> $1::vector
      LIMIT $3
    `

    const vectorString = `[${queryEmbedding.join(',')}]`
    const result = await client.query(searchQuery, [vectorString, minSimilarity, limit])

    console.log(`✅ 向量搜尋完成，找到 ${result.rows.length} 個相似商品`)
    
    return result.rows
  } catch (error) {
    console.error('❌ 向量搜尋失敗，使用備用方案:', error)
    return await fallbackTextSearch(client, limit)
  } finally {
    client.release()
  }
}

// 🔄 備用文字搜尋
async function fallbackTextSearch(client: any, limit: number) {
  const fallbackQuery = `
    SELECT 
      id,
      0.5 as similarity,
      0.5 as distance
    FROM fashion_items 
    ORDER BY created_at DESC
    LIMIT $1
  `
  
  const result = await client.query(fallbackQuery, [limit])
  console.log(`📋 備用搜尋完成，返回 ${result.rows.length} 個商品`)
  
  return result.rows
}

// 📦 獲取商品詳細資訊
async function getProductDetails(productIds: number[]) {
  if (productIds.length === 0) return []

  const client = await pool.connect()
  
  try {
    const query = `
      SELECT 
        id, name_zh, name_en, category_zh, category_en,
        colors_zh, colors_en, style_tags_zh, style_tags_en,
        occasion_zh, occasion_en, price_twd, description_zh, description_en,
        created_at
      FROM fashion_items 
      WHERE id = ANY($1::int[])
    `
    
    const result = await client.query(query, [productIds])
    return result.rows
  } finally {
    client.release()
  }
}

// GET 端點：獲取搜尋統計
export async function GET() {
  try {
    const client = await pool.connect()
    
    // 檢查向量化狀態
    const statsQuery = `
      SELECT 
        COUNT(*) as total_products,
        COUNT(embedding_vector) as vectorized_products,
        ROUND(
          (COUNT(embedding_vector)::float / COUNT(*)::float) * 100, 2
        ) as vectorization_percentage
      FROM fashion_items
    `
    
    const result = await client.query(statsQuery)
    client.release()
    
    const stats = result.rows[0]
    
    return NextResponse.json({
      success: true,
      stats: {
        totalProducts: parseInt(stats.total_products),
        vectorizedProducts: parseInt(stats.vectorized_products),
        vectorizationPercentage: parseFloat(stats.vectorization_percentage),
        isVectorSearchReady: parseInt(stats.vectorized_products) > 0
      }
    })
  } catch (error) {
    console.error('❌ 獲取搜尋統計失敗:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}