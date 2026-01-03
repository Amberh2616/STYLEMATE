// 🎯 智能語義篩選系統
// 用於根據用戶查詢智能過濾商品

import { Product } from './products'

interface QueryInfo {
  // 類型檢測
  wantsDress: boolean
  wantsTop: boolean
  wantsBottom: boolean
  wantsJacket: boolean

  // 提取的關鍵詞
  colors: string[]
  styles: string[]
  occasions: string[]
  seasons: string[]
}

/**
 * 智能語義篩選函數
 * 根據用戶查詢過濾商品，提高推薦精準度
 */
export function applySemanticFiltering(
  products: Product[],
  userQuery: string,
  intentAnalysis?: any
): Product[] {
  const query = userQuery.toLowerCase()

  // 提取查詢關鍵信息
  const queryInfo: QueryInfo = {
    // 類型檢測
    wantsDress: /洋裝|洋装|dress|連衣裙/.test(query),
    wantsTop: /上衣|襯衫|shirt|top|t恤|tee|針織/.test(query),
    wantsBottom: /褲子|裙子|pants|skirt|下身/.test(query),
    wantsJacket: /外套|jacket|coat|大衣/.test(query),

    // 顏色檢測
    colors: extractColors(query),

    // 風格檢測
    styles: extractStyles(query),

    // 場合檢測
    occasions: extractOccasions(query),

    // 季節檢測
    seasons: extractSeasons(query)
  }

  console.log('🔍 查詢分析:', queryInfo)

  // 第一步：類型篩選（如果用戶明確指定類型）
  let filtered = products

  if (queryInfo.wantsDress || queryInfo.wantsTop || queryInfo.wantsBottom || queryInfo.wantsJacket) {
    filtered = products.filter(p => {
      const cat = (p.category || '').toLowerCase()

      if (queryInfo.wantsDress && cat.includes('dress')) return true
      if (queryInfo.wantsTop && (cat.includes('top') || cat.includes('shirt') || cat.includes('tee') || cat === '上衣')) return true
      if (queryInfo.wantsBottom && (cat.includes('pants') || cat.includes('skirt') || cat === '褲子' || cat === '裙子')) return true
      if (queryInfo.wantsJacket && (cat.includes('jacket') || cat.includes('coat') || cat === '外套')) return true

      return false
    })
    console.log(`🔍 類型篩選: ${products.length} → ${filtered.length}`)
  }

  // 第二步：顏色篩選
  if (queryInfo.colors.length > 0 && filtered.length > 0) {
    const colorFiltered = filtered.filter(p => {
      const productColors = (p.colors || []).map(c => c.toLowerCase())
      return queryInfo.colors.some(qc =>
        productColors.some(pc => pc.includes(qc) || qc.includes(pc))
      )
    })

    // 如果顏色篩選後還有足夠商品，使用顏色篩選結果
    if (colorFiltered.length >= 6) {
      filtered = colorFiltered
      console.log(`🔍 顏色篩選: ${filtered.length}`)
    } else {
      console.log(`⚠️ 顏色篩選結果過少 (${colorFiltered.length})，保持之前篩選結果`)
    }
  }

  // 第三步：風格篩選
  if (queryInfo.styles.length > 0 && filtered.length > 0) {
    const styleFiltered = filtered.filter(p => {
      const productStyle = (p.style || '').toLowerCase()
      const productTags = (p.tags || []).map(t => t.toLowerCase())

      return queryInfo.styles.some(qs =>
        productStyle.includes(qs) ||
        productTags.some(t => t.includes(qs))
      )
    })

    // 如果風格篩選後還有足夠商品，使用風格篩選結果
    if (styleFiltered.length >= 6) {
      filtered = styleFiltered
      console.log(`🔍 風格篩選: ${filtered.length}`)
    } else {
      console.log(`⚠️ 風格篩選結果過少 (${styleFiltered.length})，保持之前篩選結果`)
    }
  }

  // 第四步：場合篩選
  if (queryInfo.occasions.length > 0 && filtered.length > 0) {
    const occasionFiltered = filtered.filter(p => {
      const productOccasions = (p.occasion || []).map(o => o.toLowerCase())
      return queryInfo.occasions.some(qo =>
        productOccasions.some(po => po.includes(qo) || qo.includes(po))
      )
    })

    if (occasionFiltered.length >= 6) {
      filtered = occasionFiltered
      console.log(`🔍 場合篩選: ${filtered.length}`)
    } else {
      console.log(`⚠️ 場合篩選結果過少 (${occasionFiltered.length})，保持之前篩選結果`)
    }
  }

  // 第五步：季節篩選
  if (queryInfo.seasons.length > 0 && filtered.length > 0) {
    const seasonFiltered = filtered.filter(p => {
      const productSeasons = (p.season || []).map(s => s.toLowerCase())
      return queryInfo.seasons.some(qs =>
        productSeasons.some(ps => ps.includes(qs) || qs.includes(ps))
      )
    })

    if (seasonFiltered.length >= 6) {
      filtered = seasonFiltered
      console.log(`🔍 季節篩選: ${filtered.length}`)
    } else {
      console.log(`⚠️ 季節篩選結果過少 (${seasonFiltered.length})，保持之前篩選結果`)
    }
  }

  // 如果篩選後商品太少，返回原始列表
  if (filtered.length < 6) {
    console.log('⚠️ 篩選後商品過少，返回完整列表')
    return products
  }

  console.log(`✅ 語義篩選完成: ${products.length} → ${filtered.length}`)
  return filtered
}

/**
 * 提取顏色關鍵詞
 */
function extractColors(query: string): string[] {
  const colorMap: Record<string, string> = {
    '黑': 'black',
    '白': 'white',
    '灰': 'gray',
    '紅': 'red',
    '粉': 'pink',
    '藍': 'blue',
    '綠': 'green',
    '黃': 'yellow',
    '紫': 'purple',
    '棕': 'brown',
    '米': 'beige',
    '駝': 'camel',
    '卡其': 'khaki',
    '橙': 'orange',
    '酒紅': 'burgundy'
  }

  const colors: string[] = []
  for (const [zh, en] of Object.entries(colorMap)) {
    if (query.includes(zh) || query.includes(en)) {
      colors.push(zh)
      colors.push(en)
    }
  }

  return [...new Set(colors)]
}

/**
 * 提取風格關鍵詞
 */
function extractStyles(query: string): string[] {
  const styleKeywords = [
    '韓系', 'korean',
    '法式', 'french',
    '極簡', 'minimal', 'minimalist',
    '甜美', 'sweet',
    '街頭', 'street',
    '通勤', 'office',
    '休閒', 'casual',
    '復古', 'vintage', 'retro',
    '運動', 'sport', 'athletic',
    '優雅', 'elegant',
    '性感', 'sexy',
    '清新', 'fresh'
  ]

  return styleKeywords.filter(kw => query.includes(kw.toLowerCase()))
}

/**
 * 提取場合關鍵詞
 */
function extractOccasions(query: string): string[] {
  const occasionKeywords = [
    '約會', 'date',
    '上班', 'work', 'office',
    '派對', 'party',
    '休閒', 'casual',
    '正式', 'formal',
    '旅遊', 'travel', 'vacation',
    '商務', 'business'
  ]

  return occasionKeywords.filter(kw => query.includes(kw.toLowerCase()))
}

/**
 * 提取季節關鍵詞
 */
function extractSeasons(query: string): string[] {
  const seasonKeywords = [
    '春', 'spring',
    '夏', 'summer',
    '秋', 'fall', 'autumn',
    '冬', 'winter'
  ]

  return seasonKeywords.filter(kw => query.includes(kw.toLowerCase()))
}

/**
 * 執行期類型約束校驗
 * 確保推薦的商品符合用戶指定的類型要求
 */
export function validateCategoryConstraints(
  products: Product[],
  userQuery: string
): Product[] {
  const query = userQuery.toLowerCase()

  // 檢測用戶是否明確要求特定類型
  const constraints = {
    onlyTops: /只要上衣|只推薦上衣|[0-9]+件上衣/.test(query) && !query.includes('下身') && !query.includes('裙') && !query.includes('褲'),
    onlyBottoms: /只要下身|只推薦下身|[0-9]+件下身|[0-9]+件褲|[0-9]+件裙/.test(query) && !query.includes('上衣'),
    onlyDresses: /只要洋裝|只推薦洋裝|[0-9]+件洋裝/.test(query) && !query.includes('上衣') && !query.includes('下身'),
    noDresses: /不要洋裝|別推薦洋裝/.test(query)
  }

  console.log('🔍 類型約束檢測:', constraints)

  let filtered = products

  // 應用約束
  if (constraints.onlyTops) {
    filtered = products.filter(p => {
      const cat = (p.category || '').toLowerCase()
      return cat.includes('top') || cat.includes('shirt') || cat.includes('tee') || cat === '上衣'
    })
    console.log(`🛡️ 只推薦上衣約束: ${products.length} → ${filtered.length}`)
  } else if (constraints.onlyBottoms) {
    filtered = products.filter(p => {
      const cat = (p.category || '').toLowerCase()
      return cat.includes('pants') || cat.includes('skirt') || cat === '褲子' || cat === '裙子'
    })
    console.log(`🛡️ 只推薦下身約束: ${products.length} → ${filtered.length}`)
  } else if (constraints.onlyDresses) {
    filtered = products.filter(p => {
      const cat = (p.category || '').toLowerCase()
      return cat.includes('dress')
    })
    console.log(`🛡️ 只推薦洋裝約束: ${products.length} → ${filtered.length}`)
  } else if (constraints.noDresses) {
    filtered = products.filter(p => {
      const cat = (p.category || '').toLowerCase()
      return !cat.includes('dress')
    })
    console.log(`🛡️ 排除洋裝約束: ${products.length} → ${filtered.length}`)
  }

  return filtered
}
