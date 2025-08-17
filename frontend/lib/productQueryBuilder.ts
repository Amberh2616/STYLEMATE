// Product Query Builder - 雙段式LLM第一段核心
// 負責把用戶輸入+Context轉換成標準的ProductQuery[]

import type { 
  ProductQuery, 
  IntentSummary, 
  WeatherContext, 
  UserProfile 
} from '../backend/llm/validators/zodSchemas'

export interface ProductQueryBuilderInput {
  intent: IntentSummary
  userProfile?: UserProfile
  weatherContext?: WeatherContext
  trendsData?: {
    key_styles: string[]
    key_colors: string[]
    popular_items: string[]
    fabric_textures: string[]
  }
  ragHints?: {
    positive_rules: Array<{ key: string; description: string; weight: number }>
    negative_rules: Array<{ key: string; description: string; weight: number }>
  }
}

export interface ProductQueryBuilderOutput {
  productQueries: ProductQuery[]
  expansions: {
    trends?: string[]
    colors?: string[]
    items?: string[]
  }
  reasoning: string[]
  confidence: number
}

export class ProductQueryBuilder {
  
  /**
   * 主要入口：把多種Context轉換成標準ProductQuery[]
   */
  static async buildQueries(input: ProductQueryBuilderInput): Promise<ProductQueryBuilderOutput> {
    const { intent, userProfile, weatherContext, trendsData, ragHints } = input
    
    console.log('🧩 Product Query Builder 開始處理:', {
      mode: intent.mode,
      hasWeather: !!weatherContext,
      hasTrends: !!trendsData,
      hasRAG: !!ragHints
    })

    const baseQueries = this.buildBaseQueries(intent, userProfile)
    const expandedQueries = this.applyContextExpansions(baseQueries, {
      weather: weatherContext,
      trends: trendsData,
      rag: ragHints
    })
    
    const expansions = this.extractExpansions(trendsData, weatherContext)
    const reasoning = this.generateReasoning(intent, baseQueries, expandedQueries)
    
    return {
      productQueries: expandedQueries,
      expansions,
      reasoning,
      confidence: this.calculateConfidence(intent, baseQueries)
    }
  }

  /**
   * 第一步：基於Intent和UserProfile建立基礎查詢
   */
  private static buildBaseQueries(intent: IntentSummary, userProfile?: UserProfile): ProductQuery[] {
    const queries: ProductQuery[] = []
    
    switch (intent.mode) {
      case 'analyze_and_recommend':
        // 圖片分析模式：基於視覺特徵生成查詢
        queries.push(...this.buildImageAnalysisQueries(intent, userProfile))
        break
        
      case 'travel_plan':
        // 旅行模式：基於目的地和日期生成查詢
        queries.push(...this.buildTravelQueries(intent, userProfile))
        break
        
      case 'trend_summary':
        // 趨勢模式：基於流行元素生成查詢
        queries.push(...this.buildTrendQueries(intent, userProfile))
        break
        
      case 'rerank':
        // 重排模式：基於現有商品優化查詢
        queries.push(...this.buildRerankQueries(intent, userProfile))
        break
        
      default:
        // 一般推薦：基於文字分析生成查詢
        queries.push(...this.buildGeneralQueries(intent, userProfile))
    }
    
    return queries
  }

  /**
   * 圖片分析查詢生成
   */
  private static buildImageAnalysisQueries(intent: IntentSummary, userProfile?: UserProfile): ProductQuery[] {
    // 基於圖片可能的服裝類型生成多樣化查詢
    const baseQuery: ProductQuery = {
      category: undefined, // 由後續VLM分析決定
      style_tags: userProfile?.style_whitelist || [],
      fit: userProfile?.fit_preference || ['標準'],
      color: userProfile?.color_palette || [],
      occasion: intent.occasions || ['休閒'],
      price_range: '不確定'
    }

    // 生成多個類別的查詢組合
    const categories = ['上衣', '洋裝', '下身', '外套']
    return categories.map(category => ({
      ...baseQuery,
      category
    }))
  }

  /**
   * 旅行查詢生成
   */
  private static buildTravelQueries(intent: IntentSummary, userProfile?: UserProfile): ProductQuery[] {
    const destinations = intent.destinations || ['不確定']
    const queries: ProductQuery[] = []
    
    for (const destination of destinations) {
      // 基於目的地特性調整查詢
      const destQuery = this.adjustForDestination(destination, userProfile)
      
      // 旅行必需品類別
      const travelCategories = ['上衣', '下身', '鞋', '外套', '配件']
      travelCategories.forEach(category => {
        queries.push({
          ...destQuery,
          category,
          occasion: ['旅遊', ...(intent.occasions || [])]
        })
      })
    }
    
    return queries
  }

  /**
   * 趨勢查詢生成
   */
  private static buildTrendQueries(intent: IntentSummary, userProfile?: UserProfile): ProductQuery[] {
    // 趨勢模式重點在於展示最新流行元素
    return [{
      category: undefined,
      style_tags: [], // 將由trends數據填充
      fit: ['標準', '寬鬆'], // 趨勢通常偏向寬鬆
      color: [], // 將由trends數據填充
      occasion: ['休閒', '街頭'],
      price_range: '不確定'
    }]
  }

  /**
   * 重排查詢生成
   */
  private static buildRerankQueries(intent: IntentSummary, userProfile?: UserProfile): ProductQuery[] {
    // 重排模式基於現有偏好優化
    return [{
      category: undefined,
      style_tags: userProfile?.style_whitelist || [],
      fit: userProfile?.fit_preference || ['標準'],
      color: userProfile?.color_palette || [],
      occasion: intent.occasions || ['休閒'],
      price_range: '不確定'
    }]
  }

  /**
   * 一般查詢生成
   */
  private static buildGeneralQueries(intent: IntentSummary, userProfile?: UserProfile): ProductQuery[] {
    // 基於文字查詢解析生成
    const textAnalysis = this.analyzeTextQuery(intent.text_query || '')
    
    return [{
      category: textAnalysis.category,
      style_tags: [...textAnalysis.styles, ...(userProfile?.style_whitelist || [])],
      fit: userProfile?.fit_preference || ['標準'],
      color: [...textAnalysis.colors, ...(userProfile?.color_palette || [])],
      occasion: intent.occasions || textAnalysis.occasions,
      price_range: textAnalysis.priceRange || '不確定'
    }]
  }

  /**
   * 第二步：應用Context擴展
   */
  private static applyContextExpansions(
    baseQueries: ProductQuery[],
    context: {
      weather?: WeatherContext
      trends?: any
      rag?: any
    }
  ): ProductQuery[] {
    return baseQueries.map(query => {
      let expandedQuery = { ...query }
      
      // 天氣Context應用
      if (context.weather) {
        expandedQuery = this.applyWeatherContext(expandedQuery, context.weather)
      }
      
      // 趨勢Context應用
      if (context.trends) {
        expandedQuery = this.applyTrendsContext(expandedQuery, context.trends)
      }
      
      // RAG Context應用
      if (context.rag) {
        expandedQuery = this.applyRagContext(expandedQuery, context.rag)
      }
      
      return expandedQuery
    })
  }

  /**
   * 天氣Context應用邏輯
   */
  private static applyWeatherContext(query: ProductQuery, weather: WeatherContext): ProductQuery {
    const newQuery = { ...query }
    
    // 溫度影響材質和版型
    if (weather.temperature !== undefined) {
      if (weather.temperature < 15) {
        // 寒冷天氣
        newQuery.material = [...(newQuery.material || []), '羊毛', '厚棉', '刷毛']
        newQuery.fit = ['標準', '寬鬆'] // 利於保暖層次
      } else if (weather.temperature > 28) {
        // 炎熱天氣
        newQuery.material = [...(newQuery.material || []), '棉麻', '透氣', '薄紗']
        newQuery.fit = ['寬鬆'] // 透氣舒適
      }
    }
    
    // 降雨影響材質選擇
    if (weather.rain_probability && weather.rain_probability > 50) {
      newQuery.material = [...(newQuery.material || []), '防水', '快乾']
    }
    
    // UV指數影響覆蓋度
    if (weather.uv_index && weather.uv_index > 7) {
      // 高UV建議長袖或防曬
      newQuery.style_tags = [...(newQuery.style_tags || []), '長袖', '防曬']
    }
    
    return newQuery
  }

  /**
   * 趨勢Context應用邏輯
   */
  private static applyTrendsContext(query: ProductQuery, trends: any): ProductQuery {
    return {
      ...query,
      style_tags: [...(query.style_tags || []), ...(trends.key_styles || [])],
      color: [...(query.color || []), ...(trends.key_colors || [])],
      material: [...(query.material || []), ...(trends.fabric_textures || [])]
    }
  }

  /**
   * RAG Context應用邏輯
   */
  private static applyRagContext(query: ProductQuery, rag: any): ProductQuery {
    const newQuery = { ...query }
    
    // 正面規則增強
    rag.positive_rules?.forEach((rule: any) => {
      if (rule.key.includes('版型') && rule.weight > 0.3) {
        // 高權重版型建議
        newQuery.fit = [rule.key.includes('寬鬆') ? '寬鬆' : '標準']
      }
    })
    
    // 負面規則過濾會在重排階段處理
    
    return newQuery
  }

  /**
   * 輔助：目的地特性調整
   */
  private static adjustForDestination(destination: string, userProfile?: UserProfile): Partial<ProductQuery> {
    const dest = destination.toLowerCase()
    
    if (dest.includes('海邊') || dest.includes('beach')) {
      return {
        style_tags: ['度假', '海邊'],
        material: ['防水', '快乾', '抗UV'],
        color: ['明亮', '度假色']
      }
    }
    
    if (dest.includes('商務') || dest.includes('會議')) {
      return {
        style_tags: ['正式', '商務'],
        fit: ['合身', '標準'],
        color: ['深色', '中性'],
        occasion: ['商務簡報', '正式']
      }
    }
    
    return {
      style_tags: userProfile?.style_whitelist || [],
      fit: userProfile?.fit_preference || ['標準']
    }
  }

  /**
   * 輔助：文字查詢分析
   */
  private static analyzeTextQuery(text: string) {
    const t = text.toLowerCase()
    
    // 簡單關鍵字匹配（實際可用NLP模型增強）
    const analysis = {
      category: undefined as string | undefined,
      styles: [] as string[],
      colors: [] as string[],
      occasions: ['休閒'] as string[],
      priceRange: undefined as string | undefined
    }
    
    // 類別檢測
    if (t.includes('洋裝') || t.includes('dress')) analysis.category = '洋裝'
    if (t.includes('上衣') || t.includes('top')) analysis.category = '上衣'
    if (t.includes('褲') || t.includes('pants')) analysis.category = '下身'
    
    // 風格檢測
    if (t.includes('韓') || t.includes('korean')) analysis.styles.push('清新韓系 (Fresh Korean)')
    if (t.includes('法式') || t.includes('french')) analysis.styles.push('法式優雅 (French Chic)')
    if (t.includes('極簡') || t.includes('minimal')) analysis.styles.push('極簡 (Minimalist)')
    
    // 顏色檢測
    if (t.includes('黑') || t.includes('black')) analysis.colors.push('黑')
    if (t.includes('白') || t.includes('white')) analysis.colors.push('白')
    if (t.includes('紅') || t.includes('red')) analysis.colors.push('紅')
    
    // 場合檢測
    if (t.includes('上班') || t.includes('工作')) analysis.occasions = ['通勤']
    if (t.includes('約會') || t.includes('date')) analysis.occasions = ['約會']
    if (t.includes('正式') || t.includes('formal')) analysis.occasions = ['正式']
    
    return analysis
  }

  /**
   * 提取擴展關鍵詞
   */
  private static extractExpansions(trendsData?: any, weatherContext?: WeatherContext) {
    return {
      trends: trendsData?.key_styles || [],
      colors: trendsData?.key_colors || [],
      items: trendsData?.popular_items || []
    }
  }

  /**
   * 生成推理過程
   */
  private static generateReasoning(
    intent: IntentSummary,
    baseQueries: ProductQuery[],
    expandedQueries: ProductQuery[]
  ): string[] {
    const reasoning = [
      `基於 ${intent.mode} 模式生成 ${baseQueries.length} 個基礎查詢`
    ]
    
    if (intent.occasions?.length) {
      reasoning.push(`場合需求: ${intent.occasions.join('、')}`)
    }
    
    if (expandedQueries.length > baseQueries.length) {
      reasoning.push('應用Context擴展增加查詢多樣性')
    }
    
    return reasoning
  }

  /**
   * 計算查詢信心度
   */
  private static calculateConfidence(intent: IntentSummary, queries: ProductQuery[]): number {
    let confidence = 0.5 // 基礎信心度
    
    // 有明確場合 +0.2
    if (intent.occasions?.length) confidence += 0.2
    
    // 有文字查詢 +0.1
    if (intent.text_query) confidence += 0.1
    
    // 有圖片 +0.2
    if (intent.has_image) confidence += 0.2
    
    return Math.min(confidence, 0.95)
  }
}