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
    const { query, type = 'text', limit = 10 } = await request.json()

    console.log('🎯 Fashion-CLIP 演示搜尋:', { query, type, limit })

    if (!query) {
      return NextResponse.json({
        success: false,
        error: '需要提供搜尋查詢'
      }, { status: 400 })
    }

    // 🤖 模擬 Fashion-CLIP 語義理解
    const semanticResults = await simulateFashionClipSearch(query)

    return NextResponse.json({
      success: true,
      results: semanticResults,
      query,
      searchType: type,
      totalResults: semanticResults.length,
      searchInfo: {
        model: 'Fashion-CLIP 演示版本',
        note: '這是基於語義規則的演示，真實版本需要 pgvector 向量資料庫'
      }
    })

  } catch (error) {
    console.error('❌ Fashion-CLIP 演示搜尋錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Fashion-CLIP 演示搜尋失敗'
    }, { status: 500 })
  }
}

// 🎯 模擬 Fashion-CLIP 語義搜尋
async function simulateFashionClipSearch(query: string) {
  const client = await pool.connect()
  
  try {
    // 獲取所有商品
    const allItemsQuery = `
      SELECT 
        id, name_zh, name_en, category_zh, category_en,
        colors_zh, colors_en, style_tags_zh, style_tags_en,
        occasion_zh, occasion_en, price_twd, description_zh, description_en
      FROM fashion_items 
      ORDER BY created_at DESC
    `
    
    const result = await client.query(allItemsQuery)
    const allItems = result.rows

    console.log(`📦 總共 ${allItems.length} 個商品`)

    // 🧠 語義分析和評分
    const scoredItems = allItems.map(item => {
      const score = calculateSemanticScore(query, item)
      return {
        ...item,
        similarity: score,
        distance: 1 - score
      }
    })

    // 📊 按相似度排序並篩選
    const filteredResults = scoredItems
      .filter(item => item.similarity > 0.1) // 最低相似度門檻
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 8)

    console.log(`🎯 找到 ${filteredResults.length} 個相關商品`)
    
    return filteredResults

  } finally {
    client.release()
  }
}

// 🧠 計算語義相似度分數 (顏色和類別優先確認後計算)
function calculateSemanticScore(query: string, item: any): number {
  const queryLower = query.toLowerCase()
  let score = 0

  // 📝 建立商品描述文本
  const itemText = [
    item.name_zh || '',
    item.category_zh || '',
    item.description_zh || '',
    Array.isArray(item.style_tags_zh) ? item.style_tags_zh.join(' ') : (item.style_tags_zh || ''),
    Array.isArray(item.colors_zh) ? item.colors_zh.join(' ') : (item.colors_zh || ''),
    Array.isArray(item.occasion_zh) ? item.occasion_zh.join(' ') : (item.occasion_zh || '')
  ].join(' ').toLowerCase()

  // 🎨 【第1重點】顏色確認與匹配 (最高權重)
  const colorKeywords = {
    '白色': ['白色', '白', 'white'],
    '黑色': ['黑色', '黑', 'black'],
    '粉色': ['粉色', '粉紅', 'pink'],
    '米色': ['米色', '米白', 'beige'],
    '灰色': ['灰色', '灰', 'gray', 'grey'],
    '藍色': ['藍色', '藍', 'blue'],
    '紅色': ['紅色', '紅', 'red'],
    '深色': ['深色', '黑色', '深藍', '深灰'],
    '淺色': ['淺色', '白色', '米色', '粉色'],
    '暖色': ['暖色', '紅色', '橙色', '黃色', '粉色'],
    '冷色': ['冷色', '藍色', '綠色', '紫色', '灰色']
  }

  let colorMatched = false
  let matchedColors = []
  
  // 先檢查用戶是否指定了顏色
  for (const [color, variations] of Object.entries(colorKeywords)) {
    if (queryLower.includes(color)) {
      matchedColors.push(color)
      // 檢查商品是否有對應顏色
      for (const variation of variations) {
        if (itemText.includes(variation)) {
          score += 1.0  // 顏色完全匹配最高分
          colorMatched = true
          console.log(`🎨 顏色匹配成功: 查詢「${color}」-> 商品有「${variation}」`)
          break
        }
      }
    }
  }

  // 👔 【第2重點】類別確認與匹配 (第二高權重)
  const categoryKeywords = {
    '洋裝': ['洋裝', '連身裙', '裙子', 'dress'],
    '上衣': ['上衣', 'T恤', '襯衫', '衫', 'top', 'shirt'],
    '外套': ['外套', '夾克', '大衣', '披肩', 'jacket', 'coat'],
    '褲子': ['褲子', '長褲', '短褲', 'pants', 'trousers'],
    '裙子': ['裙子', '短裙', '長裙', 'skirt'],
    '套裝': ['套裝', '西裝', 'suit']
  }

  let categoryMatched = false
  let matchedCategories = []

  // 先檢查用戶是否指定了類別
  for (const [category, variations] of Object.entries(categoryKeywords)) {
    if (queryLower.includes(category)) {
      matchedCategories.push(category)
      // 檢查商品是否為對應類別
      for (const variation of variations) {
        if (itemText.includes(variation) || (item.category_zh && item.category_zh.includes(variation))) {
          score += 0.8  // 類別完全匹配第二高分
          categoryMatched = true
          console.log(`👔 類別匹配成功: 查詢「${category}」-> 商品為「${item.category_zh}」`)
          break
        }
      }
    }
  }

  // 🔍 確認階段：如果用戶明確指定了顏色或類別但商品不匹配，大幅降低分數
  if (matchedColors.length > 0 && !colorMatched) {
    console.log(`❌ 顏色不匹配: 用戶要求「${matchedColors.join('、')}」但商品沒有`)
    score *= 0.1  // 大幅降低不匹配商品的分數
  }
  
  if (matchedCategories.length > 0 && !categoryMatched) {
    console.log(`❌ 類別不匹配: 用戶要求「${matchedCategories.join('、')}」但商品不是`)
    score *= 0.1  // 大幅降低不匹配商品的分數
  }

  // 🌧️ 天氣相關詞彙映射
  const weatherKeywords = {
    '下雨': ['防水', '雨衣', '外套', '長袖', '厚'],
    '雨天': ['防水', '雨衣', '外套', '長袖', '厚'],
    '濕冷': ['保暖', '厚', '長袖', '外套'],
    '潮濕': ['防水', '快乾', '透氣']
  }

  // 🎨 風格詞彙映射
  const styleKeywords = {
    '優雅': ['優雅', '正式', '氣質', '知性'],
    '甜美': ['甜美', '可愛', '粉色', '蕾絲'],
    '韓系': ['韓系', '韓式', '簡約'],
    '休閒': ['休閒', '舒適', '日常'],
    '約會': ['約會', '浪漫', '甜美', '優雅'],
    '上班': ['正式', '專業', '優雅', '簡約'],
    '專業': ['專業', '正式', '上班', '商務']
  }

  // 🏷️ 場合詞彙映射
  const occasionKeywords = {
    '工作': ['上班', '工作', '專業', '正式'],
    '約會': ['約會', '浪漫', '甜美'],
    '日常': ['日常', '休閒', '舒適'],
    '聚會': ['聚會', '派對', '社交']
  }

  // ✅ 顏色和類別確認完成後，計算其他標籤分數
  console.log(`📊 基礎分數 (顏色+類別): ${score.toFixed(2)}`)

  // 🎯 直接關鍵字匹配 (中權重)
  if (itemText.includes(queryLower)) {
    score += 0.6
    console.log(`🔍 關鍵字匹配: +0.6`)
  }

  // 🌧️ 天氣相關語義分析
  for (const [weather, relatedWords] of Object.entries(weatherKeywords)) {
    if (queryLower.includes(weather)) {
      for (const word of relatedWords) {
        if (itemText.includes(word)) {
          score += 0.3
          console.log(`🌧️ 天氣匹配: ${weather} -> ${word} (+0.3)`)
        }
      }
    }
  }

  // 🎨 風格語義分析
  for (const [style, relatedWords] of Object.entries(styleKeywords)) {
    if (queryLower.includes(style)) {
      for (const word of relatedWords) {
        if (itemText.includes(word)) {
          score += 0.4
          console.log(`🎨 風格匹配: ${style} -> ${word} (+0.4)`)
        }
      }
    }
  }

  // 🏷️ 場合語義分析
  for (const [occasion, relatedWords] of Object.entries(occasionKeywords)) {
    if (queryLower.includes(occasion)) {
      for (const word of relatedWords) {
        if (itemText.includes(word)) {
          score += 0.4
          console.log(`🏷️ 場合匹配: ${occasion} -> ${word} (+0.4)`)
        }
      }
    }
  }

  // 🎨 特殊語義規則 (僅在沒有明確指定顏色/類別時應用)
  if (queryLower.includes('下雨') || queryLower.includes('雨天')) {
    // 下雨天：如果用戶沒有明確指定類別，推薦外套
    if (matchedCategories.length === 0 && item.category_zh === '外套') {
      score += 0.7
      console.log(`🌧️ 下雨天推薦: 外套類別 (+0.7)`)
    }
    // 如果用戶沒有明確指定顏色，推薦深色
    if (matchedColors.length === 0 && (itemText.includes('黑色') || itemText.includes('深色'))) {
      score += 0.6
      console.log(`🌧️ 下雨天推薦: 深色系 (+0.6)`)
    }
    // 功能性加分
    if (itemText.includes('長袖')) score += 0.3
    if (itemText.includes('防水')) score += 0.5
  }

  if (queryLower.includes('約會')) {
    // 約會：如果用戶沒有明確指定類別，推薦洋裝
    if (matchedCategories.length === 0 && item.category_zh === '洋裝') {
      score += 0.7
      console.log(`💕 約會推薦: 洋裝類別 (+0.7)`)
    }
    // 如果用戶沒有明確指定顏色，推薦甜美色系
    if (matchedColors.length === 0 && (itemText.includes('粉色') || itemText.includes('白色'))) {
      score += 0.6
      console.log(`💕 約會推薦: 甜美色系 (+0.6)`)
    }
    // 風格加分
    if (itemText.includes('甜美') || itemText.includes('優雅')) score += 0.3
  }

  if (queryLower.includes('上班') || queryLower.includes('工作')) {
    // 上班：如果用戶沒有明確指定類別，推薦正式類別
    if (matchedCategories.length === 0 && (item.category_zh === '上衣' || item.category_zh === '外套')) {
      score += 0.7
      console.log(`💼 上班推薦: 正式類別 (+0.7)`)
    }
    // 如果用戶沒有明確指定顏色，推薦經典色系
    if (matchedColors.length === 0 && (itemText.includes('黑色') || itemText.includes('白色') || itemText.includes('灰色'))) {
      score += 0.6
      console.log(`💼 上班推薦: 經典色系 (+0.6)`)
    }
    // 風格加分
    if (itemText.includes('正式') || itemText.includes('專業')) score += 0.3
  }

  // 🎯 標準化分數 (0-1) 並記錄最終分數
  const finalScore = Math.min(score, 1.0)
  console.log(`📈 商品「${item.name_zh}」最終分數: ${finalScore.toFixed(2)}`)
  
  return finalScore
}

// GET 端點：獲取演示說明
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Fashion-CLIP 演示搜尋 API',
    description: '這是一個模擬 Fashion-CLIP 語義搜尋的演示版本',
    usage: {
      endpoint: 'POST /api/fashion-clip/demo-search',
      parameters: {
        query: '搜尋查詢 (如: "下雨天優雅穿搭")',
        type: 'text',
        limit: '返回結果數量 (預設 10)'
      }
    },
    examples: [
      '下雨天商品推薦',
      '韓系甜美約會風格',
      '上班族專業穿搭',
      '休閒舒適日常服'
    ]
  })
}