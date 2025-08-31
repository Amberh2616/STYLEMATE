// 智能旅遊天氣分析器
interface TravelContext {
  needsWeather: boolean
  location?: string
  cityQuery?: string
  timeContext?: string
  travelScenario?: string[]
}

interface WeatherData {
  date?: string
  location: string
  temperature: number
  condition: string
  humidity: number
  wind_speed: number
  rain_probability: number
  description: string
}

export class TravelWeatherAnalyzer {
  // 地點映射表（國家/城市 → API查詢格式）
  private static locationMap: Record<string, string> = {
    // 熱門旅遊國家
    '韓國': 'Seoul,KR',
    '首爾': 'Seoul,KR', 
    '釜山': 'Busan,KR',
    '日本': 'Tokyo,JP',
    '東京': 'Tokyo,JP',
    '大阪': 'Osaka,JP',
    '京都': 'Kyoto,JP',
    '泰國': 'Bangkok,TH',
    '曼谷': 'Bangkok,TH',
    '新加坡': 'Singapore,SG',
    '馬來西亞': 'Kuala Lumpur,MY',
    '吉隆坡': 'Kuala Lumpur,MY',
    '美國': 'New York,US',
    '紐約': 'New York,US',
    '洛杉磯': 'Los Angeles,US',
    '英國': 'London,GB',
    '倫敦': 'London,GB',
    '法國': 'Paris,FR',
    '巴黎': 'Paris,FR',
    // 台灣城市
    '台北': 'Taipei,TW',
    '台中': 'Taichung,TW',
    '高雄': 'Kaohsiung,TW',
    '台南': 'Tainan,TW'
  }

  // 旅遊關鍵詞
  private static travelKeywords = [
    '旅行', '旅遊', '去', '到', '出差', '度假', '蜜月',
    'travel', 'trip', 'visit', 'vacation', 'holiday', 'business trip'
  ]

  // 時間關鍵詞
  private static timeKeywords = [
    '今天', '明天', '後天', '這週', '下週', '這個月', '下個月',
    'today', 'tomorrow', 'this week', 'next week', 'this month'
  ]

  // 天氣相關關鍵詞
  private static weatherKeywords = [
    '天氣', '下雨', '雨天', '晴天', '陰天', '溫度', '冷', '熱', '濕', '乾',
    '颱風', '寒流', '熱浪', '穿什麼', '怎麼穿',
    'weather', 'rain', 'sunny', 'cloudy', 'temperature', 'hot', 'cold', 'humid'
  ]

  // 旅遊場景關鍵詞（更詳細分類）
  private static scenarioKeywords = {
    // 商務場景
    商務會議: ['開會', '會議', '商務', '上班', '簡報', 'business', 'meeting', 'formal', 'presentation'],
    商務晚宴: ['商務晚宴', '應酬', '客戶聚餐', 'business dinner', 'client dinner'],
    
    // 休閒場景  
    逛街購物: ['逛街', '購物', '血拼', '市集', 'shopping', 'mall', 'market'],
    咖啡約會: ['咖啡', '下午茶', '約會', 'coffee', 'cafe', 'date', 'brunch'],
    晚餐聚會: ['晚餐', '聚餐', '朋友聚會', 'dinner', 'gathering', 'friends'],
    
    // 特殊場合
    婚禮參加: ['婚禮', '婚宴', '結婚', 'wedding', 'ceremony', '伴娘', '伴郎'],
    畢業典禮: ['畢業', '典禮', '學位', 'graduation', 'ceremony'],
    面試求職: ['面試', '求職', '工作', 'interview', 'job', 'career'],
    
    // 娛樂場景
    派對慶祝: ['派對', '慶祝', '生日', 'party', 'celebration', 'birthday'],
    夜生活: ['酒吧', '夜店', '夜生活', 'bar', 'club', 'nightlife'],
    
    // 戶外場景
    海邊度假: ['海邊', '海灘', '度假', '游泳', 'beach', 'seaside', 'vacation', 'swimming'],
    觀光旅遊: ['觀光', '景點', '博物館', '古蹟', 'sightseeing', 'museum', 'tourist', 'temple'],
    戶外運動: ['登山', '健行', '公園', '運動', 'hiking', 'outdoor', 'sports', 'exercise'],
    
    // 文化場景
    文化活動: ['展覽', '音樂會', '劇院', '藝術', 'exhibition', 'concert', 'theater', 'art'],
    宗教場所: ['寺廟', '教堂', '神社', '清真寺', 'temple', 'church', 'shrine', 'mosque'],
    
    // 流行趨勢查詢
    流行趨勢: ['流行', '趨勢', '潮流', '時尚', '最新', 'trend', 'fashion', 'style', 'latest']
  }

  // 文化禁忌和建議
  private static culturalTips = {
    '日本': {
      禁忌: ['進寺廟避免無袖', '不要穿太露的服裝', '脫鞋的場合很多'],
      建議: ['層次穿搭很受歡迎', '簡約風格為主', '準備好脫的鞋子'],
      潮流: ['寬鬆牛仔褲', '針織外套', '小包包']
    },
    '韓國': {
      禁忌: ['避免過於暴露', '某些場所不能穿拖鞋'],
      建議: ['韓系甜美風很適合', '重視整體搭配', '配件很重要'],
      潮流: ['oversized外套', '高腰褲', '小白鞋', '漁夫帽']
    },
    '泰國': {
      禁忌: ['寺廟必須長袖長褲', '不能露肩膀'],
      建議: ['輕薄透氣材質', '防曬很重要', '涼鞋好選擇'],
      潮流: ['度假風洋裝', '寬鬆上衣', '草帽']
    },
    '新加坡': {
      禁忌: ['某些場所有dress code'],
      建議: ['商務休閒風格', '輕薄但正式', '隨身帶薄外套'],
      潮流: ['都會簡約風', '亞麻材質', '舒適平底鞋']
    }
  }

  /**
   * 分析用戶輸入，提取旅遊和天氣相關信息
   */
  static analyzeUserInput(userInput: string): TravelContext {
    const input = userInput.toLowerCase()
    
    // 檢測是否需要天氣信息
    const hasWeatherKeywords = this.weatherKeywords.some(keyword => 
      input.includes(keyword.toLowerCase())
    )
    const hasTravelKeywords = this.travelKeywords.some(keyword => 
      input.includes(keyword.toLowerCase())
    )
    const hasTimeKeywords = this.timeKeywords.some(keyword => 
      input.includes(keyword.toLowerCase())
    )

    // 提取地點 - 加強「去某地」模式識別
    let detectedLocation = Object.keys(this.locationMap).find(location => 
      userInput.includes(location)
    )
    
    // 如果沒找到預設地點，嘗試從「去某地」模式中提取
    if (!detectedLocation) {
      const goPattern = /去\s*([^\s，。！？]{1,10})/
      const match = userInput.match(goPattern)
      if (match && match[1]) {
        const destination = match[1]
        // 檢查是否在我們的地點庫中
        const foundKey = Object.keys(this.locationMap).find(key => 
          key.includes(destination) || destination.includes(key)
        )
        if (foundKey) {
          detectedLocation = foundKey
        }
      }
    }

    // 提取時間語境
    const timeContext = this.timeKeywords.find(time => 
      input.includes(time.toLowerCase())
    )

    // 提取旅遊場景
    const travelScenarios = Object.entries(this.scenarioKeywords)
      .filter(([_, keywords]) => 
        keywords.some(keyword => input.includes(keyword.toLowerCase()))
      )
      .map(([scenario, _]) => scenario)

    // 判斷是否需要天氣數據 - 只要有地點就需要天氣
    const needsWeather = !!(
      hasWeatherKeywords || 
      hasTravelKeywords || 
      hasTimeKeywords || 
      detectedLocation ||
      /去\s*[^\s，。！？]{1,10}/.test(userInput) // 「去某地」模式
    )

    return {
      needsWeather,
      location: detectedLocation,
      cityQuery: detectedLocation ? this.locationMap[detectedLocation] : undefined,
      timeContext,
      travelScenario: travelScenarios.length > 0 ? travelScenarios : undefined
    }
  }

  /**
   * 調用 OpenWeatherMap API 獲取5天天氣預報
   */
  static async fetch5DayForecast(cityQuery: string, apiKey: string): Promise<WeatherData[]> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityQuery}&appid=${apiKey}&units=metric&lang=zh_tw`
      )
      
      if (!response.ok) {
        console.log(`5-day forecast API error: ${response.status}`)
        return this.getFallback5DayData(cityQuery)
      }

      const data = await response.json()
      
      // 處理5天預報數據（每3小時一筆，取每日中午12-15點的數據）
      const dailyForecasts: WeatherData[] = []
      const processedDates = new Set()
      
      for (const item of data.list) {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0]
        const hour = new Date(item.dt * 1000).getHours()
        
        // 取每天中午時段的數據
        if (!processedDates.has(date) && hour >= 12 && hour <= 15) {
          processedDates.add(date)
          dailyForecasts.push({
            date,
            location: data.city.name + ', ' + data.city.country,
            temperature: Math.round(item.main.temp),
            condition: item.weather[0].main,
            description: item.weather[0].description,
            humidity: item.main.humidity,
            wind_speed: Math.round(item.wind.speed * 3.6),
            rain_probability: Math.round((item.pop || 0) * 100)
          })
        }
        
        if (dailyForecasts.length >= 5) break
      }
      
      return dailyForecasts
    } catch (error) {
      console.error('5-day forecast error:', error)
      return this.getFallback5DayData(cityQuery)
    }
  }

  /**
   * 生成5天回退天氣數據
   */
  private static getFallback5DayData(cityQuery: string): WeatherData[] {
    const baseWeather = this.getFallbackWeatherData(cityQuery)
    const forecasts: WeatherData[] = []
    
    for (let i = 0; i < 5; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      
      forecasts.push({
        ...baseWeather,
        date: date.toISOString().split('T')[0],
        temperature: baseWeather.temperature + (Math.random() * 6 - 3), // ±3度變化
        rain_probability: Math.max(0, baseWeather.rain_probability + (Math.random() * 20 - 10))
      })
    }
    
    return forecasts
  }

  /**
   * 生成5天穿搭計劃
   */
  static generate5DayOutfitPlan(forecasts: WeatherData[], context: TravelContext): { content: string; recommendedProducts: string[] } {
    let plan = `\n\n**🌤️ ${forecasts.length}天天氣預報與穿搭計劃**\n\n`
    let allRecommendedProducts: string[] = []
    
    forecasts.forEach((weather, index) => {
      const day = index + 1
      const clothingData = this.getClothingAdviceForWeather(weather, index)
      
      plan += `**Day ${day} (${weather.date.split('-').slice(1).join('/')})：** ${weather.temperature}°C ${weather.description}\n\n`
      plan += `🎯 **穿搭建議：** ${clothingData.advice}\n\n`
      
      if (clothingData.products.length > 0) {
        plan += `👗 **推薦商品：**\n`
        clothingData.products.forEach(productId => {
          plan += `• 商品 ID: ${productId}\n`
          // 收集所有推薦的產品 ID
          if (!allRecommendedProducts.includes(productId)) {
            allRecommendedProducts.push(productId)
          }
        })
        plan += `\n`
      }
      
      if (weather.rain_probability > 40) {
        plan += `☔ **特別提醒：** 降雨機率${weather.rain_probability}%，建議攜帶雨具。\n\n`
      } else {
        plan += `\n`
      }
    })
    
    plan += `🧳 **行李建議：** 依據天氣變化，建議準備${this.generatePackingSuggestion(forecasts)}\n`
    
    return {
      content: plan,
      recommendedProducts: allRecommendedProducts.slice(0, 6) // 限制最多6個產品推薦
    }
  }

  /**
   * 根據天氣生成穿衣建議和商品推薦
   */
  private static getClothingAdviceForWeather(weather: WeatherData, dayIndex: number = 0): { advice: string; products: string[] } {
    let advice = []
    let products = []
    
    // 🎯 動態隨機商品池 - 從資料庫獲取實際產品名稱
    const getRandomizedProducts = (temperature: number, dayIndex: number = 0): string[] => {
      // 使用真實的產品ID (基於products.ts)
      const hotWeatherProducts = [
        'dress_sweet_pink_midi',        // 粉色洋裝，適合炎熱天氣
        'dress_minimalist_white_maxi',  // 白色長洋裝，涼爽
        'top_basic_white_tee',          // 基本白T，透氣
        'top_casual_striped',           // 條紋上衣，休閒
        'shorts_high_waisted_denim'     // 高腰牛仔短褲
      ]
      
      const coldWeatherProducts = [
        'dress_elegant_floral',         // 優雅花卉洋裝，適合較冷天氣
        'dress_french_elegant',         // 法式優雅洋裝，保暖
        'top_puff_sleeve',              // 泡泡袖上衣，較保暖  
        'top_french_romantic'           // 法式浪漫上衣，長袖
      ]
      
      const allAvailableProductIds = [...hotWeatherProducts, ...coldWeatherProducts]
      
      // 根據溫度和天氣推薦不同類型
      let suitableProductIds = [...allAvailableProductIds]
      
      if (temperature >= 28) {
        // 炎熱天氣優先推薦清爽款式
        suitableProductIds = hotWeatherProducts
      } else if (temperature >= 15) {
        // 適中溫度，所有商品都適合
        suitableProductIds = allAvailableProductIds
      } else {
        // 較冷天氣優先推薦保暖款式
        suitableProductIds = coldWeatherProducts
      }
      
      // 根據天數錯開商品，避免5天重複推薦
      const shuffled = [...suitableProductIds].sort(() => Math.random() - 0.5)
      
      // 使用日期索引來確保不同天推薦不同商品
      const startIndex = (dayIndex * 1) % suitableProductIds.length
      let selectedProductIds = []
      
      // 選擇2-3個不重疊的商品
      const itemsPerDay = Math.min(3, suitableProductIds.length)
      for (let i = 0; i < itemsPerDay; i++) {
        const index = (startIndex + i) % suitableProductIds.length
        if (!selectedProductIds.includes(shuffled[index])) {
          selectedProductIds.push(shuffled[index])
        }
      }
      
      return selectedProductIds
    }
    
    // 溫度建議（使用隨機化商品推薦）
    if (weather.temperature >= 29) {
      advice.push('極輕薄材質、吸濕排汗上衣、透氣短褲')
      if (weather.wind_speed > 25) {
        advice.push('抗風外套、避免飄逸設計')
      }
      products.push(...getRandomizedProducts(weather.temperature, dayIndex))
    } else if (weather.temperature >= 23) {
      advice.push('輕薄短袖、薄款下身、舒適平底鞋')
      products.push(...getRandomizedProducts(weather.temperature, dayIndex))
    } else if (weather.temperature >= 16) {
      advice.push('薄外套、長袖上衣、舒適長褲')
      products.push(...getRandomizedProducts(weather.temperature, dayIndex))
    } else if (weather.temperature >= 9) {
      advice.push('外套、針織衫、保暖長褲')
      products.push(...getRandomizedProducts(weather.temperature, dayIndex))
    } else {
      advice.push('厚外套、保暖內搭、防寒配件')
      products.push(...getRandomizedProducts(weather.temperature, dayIndex))
    }
    
    // 雨天特殊建議
    if (weather.rain_probability > 50) {
      if (!advice.some(a => a.includes('防水'))) {
        advice.push('防水外套、防水鞋')
      }
    }
    
    return {
      advice: advice.join('、'),
      products: products.slice(0, 3) // 限制每天最多3個商品推薦
    }
  }

  /**
   * 生成打包建議
   */
  private static generatePackingSuggestion(forecasts: WeatherData[]): string {
    const avgTemp = forecasts.reduce((sum, w) => sum + w.temperature, 0) / forecasts.length
    const maxTemp = Math.max(...forecasts.map(w => w.temperature))
    const minTemp = Math.min(...forecasts.map(w => w.temperature))
    const rainDays = forecasts.filter(w => w.rain_probability > 40).length
    
    let suggestions = []
    
    if (maxTemp - minTemp > 10) {
      suggestions.push('多層次搭配（溫差大）')
    }
    
    if (rainDays > 2) {
      suggestions.push('防水用品必備')
    }
    
    if (avgTemp > 25) {
      suggestions.push('輕薄透氣材質為主')
    } else if (avgTemp < 15) {
      suggestions.push('保暖外套必需')
    }
    
    return suggestions.join('、') || '根據每日天氣準備對應服裝'
  }

  /**
   * 調用 OpenWeatherMap API 獲取天氣數據
   */
  static async fetchWeatherData(cityQuery: string, apiKey: string): Promise<WeatherData | null> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityQuery}&appid=${apiKey}&units=metric&lang=zh_tw`
      )
      
      if (!response.ok) {
        console.log(`Weather API error: ${response.status}, using fallback data`)
        // 使用回退天氣數據
        return this.getFallbackWeatherData(cityQuery)
      }

      const data = await response.json()
      
      return {
        location: data.name + ', ' + data.sys.country,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        humidity: data.main.humidity,
        wind_speed: Math.round(data.wind.speed * 3.6), // m/s 轉 km/h
        rain_probability: data.rain ? 80 : 20, // 簡化計算
        description: data.weather[0].description
      }
    } catch (error) {
      console.error('Weather API error:', error)
      // 使用回退天氣數據
      return this.getFallbackWeatherData(cityQuery)
    }
  }

  /**
   * 回退天氣數據（當API無法使用時）
   */
  static getFallbackWeatherData(cityQuery: string): WeatherData {
    const cityName = cityQuery.split(',')[0]
    
    // 根據城市提供合理的模擬天氣數據
    const fallbackData: Record<string, WeatherData> = {
      'Seoul': {
        location: 'Seoul, KR',
        temperature: 22,
        condition: 'Clouds',
        humidity: 65,
        wind_speed: 15,
        rain_probability: 30,
        description: '多雲'
      },
      'Tokyo': {
        location: 'Tokyo, JP', 
        temperature: 24,
        condition: 'Clear',
        humidity: 60,
        wind_speed: 12,
        rain_probability: 10,
        description: '晴朗'
      },
      'Bangkok': {
        location: 'Bangkok, TH',
        temperature: 32,
        condition: 'Rain',
        humidity: 80,
        wind_speed: 8,
        rain_probability: 70,
        description: '陣雨'
      },
      'Taipei': {
        location: 'Taipei, TW',
        temperature: 26,
        condition: 'Clouds',
        humidity: 75,
        wind_speed: 10,
        rain_probability: 40,
        description: '多雲'
      }
    }

    return fallbackData[cityName] || {
      location: cityName,
      temperature: 25,
      condition: 'Clear',
      humidity: 60,
      wind_speed: 10,
      rain_probability: 20,
      description: '晴朗'
    }
  }

  /**
   * 生成智能分析報告
   */
  static generateAnalysisReport(context: TravelContext, weather?: WeatherData): string {
    let report = `🧠 **智能分析結果：**<br/>`
    
    if (context.location) {
      report += `📍 **目的地：** ${context.location}<br/>`
    }
    
    if (context.timeContext) {
      report += `⏰ **時間：** ${context.timeContext}<br/>`
    }
    
    if (context.travelScenario && context.travelScenario.length > 0) {
      report += `🎯 **場景：** ${context.travelScenario.join('、')}<br/>`
    }
    
    if (weather) {
      report += `🌤️ **天氣：** ${weather.temperature}°C, ${weather.description}<br/>`
      report += `💧 **濕度：** ${weather.humidity}% | 💨 **風速：** ${weather.wind_speed}km/h<br/>`
      if (weather.rain_probability > 40) {
        report += `☔ **降雨機率：** ${weather.rain_probability}% (建議防水準備)<br/>`
      }
    }
    
    return report
  }
}

export type { TravelContext, WeatherData }