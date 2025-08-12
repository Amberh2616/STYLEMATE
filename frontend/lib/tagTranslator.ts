/**
 * 雙語標籤轉換工具
 * 用於在 FashionCLIP 英文檢索和中文前端顯示之間轉換
 */

export interface BilingualTags {
  // 英文標籤 (供 FashionCLIP 使用)
  name_en: string
  category_en: string
  colors_en: string[]
  style_tags_en: string[]
  occasion_en: string[]
  season_en: string[]
  fit_en: string
  features_en: string[]
  description_en: string
  
  // 中文標籤 (供前端顯示)
  name_zh: string
  category_zh: string
  colors_zh: string[]
  style_tags_zh: string[]
  occasion_zh: string[]
  season_zh: string[]
  fit_zh: string
  features_zh: string[]
  description_zh: string
  
  // 其他資訊
  material_guess: string
  price_tier: string
}

export class TagTranslator {
  private static readonly TAG_MAPPINGS = {
    // 服裝分類
    category: {
      'dress': '洋裝',
      'top': '上衣',
      'bottom': '下身',
      'outer': '外套',
      'set': '套裝'
    },
    
    // 風格標籤
    style: {
      'korean': '韓系',
      'sweet': '甜美',
      'elegant': '優雅',
      'casual': '休閒',
      'street': '街頭',
      'minimalist': '簡約',
      'romantic': '浪漫',
      'cute': '可愛',
      'chic': '時尚',
      'vintage': '復古'
    },
    
    // 場合
    occasion: {
      'daily': '日常',
      'casual': '休閒',
      'work': '上班',
      'date': '約會',
      'formal': '正式',
      'party': '派對',
      'shopping': '逛街',
      'weekend': '週末',
      'office': '辦公室',
      'vacation': '度假'
    },
    
    // 季節
    season: {
      'spring': '春季',
      'summer': '夏季',
      'autumn': '秋季',
      'winter': '冬季',
      'all_season': '四季'
    },
    
    // 顏色
    colors: {
      'white': '白色',
      'black': '黑色',
      'pink': '粉色',
      'blue': '藍色',
      'red': '紅色',
      'green': '綠色',
      'yellow': '黃色',
      'purple': '紫色',
      'brown': '棕色',
      'gray': '灰色',
      'beige': '米色',
      'navy': '海軍藍',
      'cream': '米白色'
    },
    
    // 版型
    fit: {
      'loose': '寬鬆',
      'regular': '合身',
      'slim': '修身',
      'oversized': '寬版',
      'tight': '緊身',
      'high_waist': '高腰',
      'a_line': 'A字'
    },
    
    // 特色
    features: {
      'slimming': '顯瘦',
      'versatile': '百搭',
      'comfortable': '舒適',
      'breathable': '透氣',
      'warm': '保暖',
      'stretchy': '彈性',
      'wrinkle_free': '不易皺',
      'easy_care': '好保養'
    }
  }
  
  /**
   * 將英文標籤轉換為中文
   */
  static translateToZh(enTag: string, category: keyof typeof TagTranslator.TAG_MAPPINGS): string {
    const mapping = TagTranslator.TAG_MAPPINGS[category]
    return mapping[enTag.toLowerCase() as keyof typeof mapping] || enTag
  }
  
  /**
   * 將中文標籤轉換為英文
   */
  static translateToEn(zhTag: string, category: keyof typeof TagTranslator.TAG_MAPPINGS): string {
    const mapping = TagTranslator.TAG_MAPPINGS[category]
    for (const [en, zh] of Object.entries(mapping)) {
      if (zh === zhTag) {
        return en
      }
    }
    return zhTag
  }
  
  /**
   * 批量轉換標籤陣列
   */
  static translateArrayToZh(enTags: string[], category: keyof typeof TagTranslator.TAG_MAPPINGS): string[] {
    return enTags.map(tag => TagTranslator.translateToZh(tag, category))
  }
  
  static translateArrayToEn(zhTags: string[], category: keyof typeof TagTranslator.TAG_MAPPINGS): string[] {
    return zhTags.map(tag => TagTranslator.translateToEn(tag, category))
  }
  
  /**
   * 生成 FashionCLIP 查詢字串
   */
  static generateFashionCLIPQuery(tags: BilingualTags): string {
    const queryParts: string[] = []
    
    // 添加分類
    queryParts.push(tags.category_en)
    
    // 添加顏色
    if (tags.colors_en.length > 0) {
      queryParts.push(...tags.colors_en.slice(0, 2))
    }
    
    // 添加風格
    if (tags.style_tags_en.length > 0) {
      queryParts.push(...tags.style_tags_en.slice(0, 2))
    }
    
    // 添加特色
    if (tags.features_en.length > 0) {
      queryParts.push(tags.features_en[0])
    }
    
    return queryParts.join(' ')
  }
  
  /**
   * 從用戶輸入的中文轉換為 FashionCLIP 查詢
   */
  static userInputToFashionCLIP(userInput: string): string {
    let englishQuery = userInput
    
    // 逐個替換中文關鍵詞
    Object.entries(TagTranslator.TAG_MAPPINGS).forEach(([_, mapping]) => {
      Object.entries(mapping).forEach(([en, zh]) => {
        englishQuery = englishQuery.replace(new RegExp(zh, 'g'), en)
      })
    })
    
    return englishQuery
  }
  
  /**
   * 根據價格層級估算台幣價格
   */
  static estimatePrice(priceTier: string): number {
    const priceMap = {
      'budget': 599,
      'mid': 899, 
      'premium': 1299,
      'luxury': 1699
    }
    
    return priceMap[priceTier as keyof typeof priceMap] || 899
  }
  
  /**
   * 生成適合的尺寸選項
   */
  static generateSizes(category: string, fit: string): string[] {
    const baseSizes = ['S', 'M', 'L']
    
    if (category === 'dress' || fit === 'loose') {
      return ['S', 'M', 'L', 'XL']
    }
    
    return baseSizes
  }
}

/**
 * 搜尋和推薦工具
 */
export class FashionSearchEngine {
  /**
   * 基於用戶輸入生成 FashionCLIP 查詢
   */
  static processUserQuery(userInput: string): {
    fashionCLIPQuery: string
    detectedTags: {
      colors: string[]
      styles: string[]
      occasions: string[]
    }
  } {
    const detectedTags = {
      colors: [] as string[],
      styles: [] as string[],
      occasions: [] as string[]
    }
    
    // 檢測中文標籤
    Object.entries(TagTranslator.TAG_MAPPINGS.colors).forEach(([en, zh]) => {
      if (userInput.includes(zh)) {
        detectedTags.colors.push(en)
      }
    })
    
    Object.entries(TagTranslator.TAG_MAPPINGS.style).forEach(([en, zh]) => {
      if (userInput.includes(zh)) {
        detectedTags.styles.push(en)
      }
    })
    
    Object.entries(TagTranslator.TAG_MAPPINGS.occasion).forEach(([en, zh]) => {
      if (userInput.includes(zh)) {
        detectedTags.occasions.push(en)
      }
    })
    
    // 生成 FashionCLIP 查詢
    const fashionCLIPQuery = TagTranslator.userInputToFashionCLIP(userInput)
    
    return {
      fashionCLIPQuery,
      detectedTags
    }
  }
  
  /**
   * 基於全身照分析生成搜尋查詢
   */
  static analyzeFullBodyImage(imageAnalysis: any): string {
    // 這裡會整合身形分析結果，生成適合的搜尋查詢
    const queryParts = []
    
    if (imageAnalysis.bodyType) {
      queryParts.push(imageAnalysis.bodyType)
    }
    
    if (imageAnalysis.currentStyle) {
      queryParts.push(imageAnalysis.currentStyle)
    }
    
    if (imageAnalysis.preferredColors) {
      queryParts.push(...imageAnalysis.preferredColors.slice(0, 2))
    }
    
    return queryParts.join(' ')
  }
}