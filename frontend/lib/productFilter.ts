interface Product {
  id: string
  name: string
  category: string
  style: string[]
  occasion: string[]
  price: number
  image: string
  shoulderPx: number
  stripeLink: string
}

interface FilterCriteria {
  styles?: string[]
  occasions?: string[]
  categories?: string[]
  maxPrice?: number
  minPrice?: number
  keywords?: string[]
}

export class ProductFilter {
  private products: Product[] = []
  
  async loadProducts() {
    try {
      const response = await fetch('/products.json')
      const data = await response.json()
      this.products = data.products
    } catch (error) {
      console.error('載入商品資料失敗:', error)
      this.products = []
    }
  }
  
  // 關鍵字過濾主函數
  filterProducts(criteria: FilterCriteria): Product[] {
    return this.products.filter(product => {
      // 風格匹配
      if (criteria.styles && criteria.styles.length > 0) {
        const hasMatchingStyle = criteria.styles.some(style => 
          product.style.includes(style.toLowerCase())
        )
        if (!hasMatchingStyle) return false
      }
      
      // 場合匹配
      if (criteria.occasions && criteria.occasions.length > 0) {
        const hasMatchingOccasion = criteria.occasions.some(occasion => 
          product.occasion.includes(occasion.toLowerCase())
        )
        if (!hasMatchingOccasion) return false
      }
      
      // 類別匹配
      if (criteria.categories && criteria.categories.length > 0) {
        if (!criteria.categories.includes(product.category)) return false
      }
      
      // 價格區間
      if (criteria.maxPrice && product.price > criteria.maxPrice) return false
      if (criteria.minPrice && product.price < criteria.minPrice) return false
      
      // 關鍵字匹配（商品名稱）
      if (criteria.keywords && criteria.keywords.length > 0) {
        const productName = product.name.toLowerCase()
        const hasMatchingKeyword = criteria.keywords.some(keyword => 
          productName.includes(keyword.toLowerCase())
        )
        if (!hasMatchingKeyword) return false
      }
      
      return true
    })
  }
  
  // 從用戶輸入解析意圖
  parseUserIntent(userMessage: string): FilterCriteria {
    const message = userMessage.toLowerCase()
    const criteria: FilterCriteria = {}
    
    // 風格關鍵字映射
    const styleKeywords = {
      '甜美': ['sweet', 'romantic'],
      '可愛': ['sweet'],
      '優雅': ['elegant'],
      '正式': ['formal'],
      '休閒': ['casual'],
      '基本': ['basic'],
      '性感': ['sexy'],
      '街頭': ['street'],
      '舒適': ['cozy'],
      '韓系': ['sweet', 'elegant'],
      '韓式': ['sweet', 'elegant']
    }
    
    // 場合關鍵字映射
    const occasionKeywords = {
      '約會': ['date'],
      '上班': ['work'],
      '工作': ['work', 'formal'],
      '聚會': ['party'],
      '派對': ['party'],
      '日常': ['daily', 'casual'],
      '正式': ['formal'],
      '週末': ['weekend'],
      '冬天': ['winter'],
      '秋天': ['autumn']
    }
    
    // 類別關鍵字
    const categoryKeywords = {
      '上衣': 'top',
      '襯衫': 'top',
      'T恤': 'top',
      '毛衣': 'top',
      '洋裝': 'dress',
      '連身裙': 'dress',
      '裙子': 'dress',
      '外套': 'outer',
      '夾克': 'outer'
    }
    
    // 解析風格
    const detectedStyles: string[] = []
    Object.entries(styleKeywords).forEach(([keyword, styles]) => {
      if (message.includes(keyword)) {
        detectedStyles.push(...styles)
      }
    })
    if (detectedStyles.length > 0) {
      criteria.styles = [...new Set(detectedStyles)]
    }
    
    // 解析場合
    const detectedOccasions: string[] = []
    Object.entries(occasionKeywords).forEach(([keyword, occasions]) => {
      if (message.includes(keyword)) {
        detectedOccasions.push(...occasions)
      }
    })
    if (detectedOccasions.length > 0) {
      criteria.occasions = [...new Set(detectedOccasions)]
    }
    
    // 解析類別
    Object.entries(categoryKeywords).forEach(([keyword, category]) => {
      if (message.includes(keyword)) {
        criteria.categories = criteria.categories || []
        criteria.categories.push(category)
      }
    })
    
    // 解析預算
    const budgetRegex = /(\d+).*(?:元|塊|以下|以內)/
    const budgetMatch = message.match(budgetRegex)
    if (budgetMatch) {
      criteria.maxPrice = parseInt(budgetMatch[1])
    }
    
    // 便宜關鍵字
    if (message.includes('便宜') || message.includes('平價')) {
      criteria.maxPrice = 800
    }
    
    return criteria
  }
  
  // 獲取推薦文字（LLM用於生成說明）
  getRecommendationText(products: Product[], userIntent: string): string {
    if (products.length === 0) {
      return `根據您的需求「${userIntent}」，目前沒有找到完全匹配的商品。建議您：
      
1. 嘗試更寬泛的風格描述
2. 調整預算範圍
3. 考慮類似的場合需求

讓我為您展示一些相近的選擇！`
    }
    
    const categories = [...new Set(products.map(p => p.category))]
    const priceRange = {
      min: Math.min(...products.map(p => p.price)),
      max: Math.max(...products.map(p => p.price))
    }
    
    return `根據您的需求「${userIntent}」，我為您精選了 ${products.length} 件商品：

✨ **推薦理由：**
${products.slice(0, 3).map(p => `• ${p.name} - 完美符合您的${p.style.join('、')}風格需求`).join('\n')}

💰 **價格區間：** NT$ ${priceRange.min} - ${priceRange.max}
🏷️ **商品類型：** ${categories.join('、')}

選擇您喜歡的商品，上傳照片就能立即試穿哦！ 📸`
  }
  
  getAllProducts(): Product[] {
    return this.products
  }
}

// 單例模式
export const productFilter = new ProductFilter()