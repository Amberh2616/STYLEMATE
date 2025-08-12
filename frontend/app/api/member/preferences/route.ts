import { NextRequest, NextResponse } from 'next/server'

interface FashionPreferences {
  memberId: string
  email: string
  preferences: {
    [key: string]: string | string[]
  }
  completedAt: string
  analysisResults?: {
    styleProfile: string
    colorProfile: string
    occasionProfile: string
    shoppingProfile: string
    recommendations: string[]
  }
}

// 模擬資料庫儲存
const preferencesDatabase: { [key: string]: FashionPreferences } = {}

// 分析問卷結果並生成個人化建議
function analyzePreferences(preferences: { [key: string]: string | string[] }): FashionPreferences['analysisResults'] {
  const answers = preferences

  // 風格分析
  let styleProfile = '混合型風格'
  const overallStyle = answers.style_overall as string
  if (overallStyle) {
    if (overallStyle.includes('甜美')) styleProfile = '甜美派'
    else if (overallStyle.includes('優雅')) styleProfile = '優雅派'
    else if (overallStyle.includes('街頭')) styleProfile = '潮流派'
    else if (overallStyle.includes('休閒')) styleProfile = '舒適派'
    else if (overallStyle.includes('韓系')) styleProfile = '韓系愛好者'
  }

  // 顏色分析
  let colorProfile = '平衡配色'
  const basicColors = answers.color_basic as string[]
  const brightColors = answers.color_bright as string[]
  if (basicColors?.length > brightColors?.length) {
    colorProfile = '經典色系偏好'
  } else if (brightColors?.length > 3) {
    colorProfile = '亮色系愛好者'
  }

  // 場合分析
  let occasionProfile = '全方位穿搭'
  const workStyle = answers.occasion_work as string
  const dateStyle = answers.occasion_date as string
  if (workStyle?.includes('正式')) occasionProfile = '職場導向型'
  else if (dateStyle?.includes('浪漫') || dateStyle?.includes('甜美')) occasionProfile = '約會甜心型'
  else if (answers.occasion_friends?.includes('舒適')) occasionProfile = '生活休閒型'

  // 購物分析
  let shoppingProfile = '理性消費者'
  const frequency = answers.shopping_frequency as string
  const decision = answers.shopping_decision as string
  if (frequency?.includes('每週') || decision?.includes('衝動')) {
    shoppingProfile = '時尚潮人'
  } else if (decision?.includes('精挑細選')) {
    shoppingProfile = '品質追求者'
  } else if (decision?.includes('實用主義')) {
    shoppingProfile = '實用主義者'
  }

  // 生成個人化推薦
  const recommendations = []
  
  if (styleProfile.includes('甜美')) {
    recommendations.push('碎花洋裝', '蕾絲上衣', '粉色系服飾', 'A字裙')
  }
  if (styleProfile.includes('優雅')) {
    recommendations.push('西裝外套', '絲質襯衫', '及膝裙', '珍珠配件')
  }
  if (styleProfile.includes('韓系')) {
    recommendations.push('oversize毛衣', '格紋裙', '針織開衫', '牛仔褲')
  }
  
  if (colorProfile.includes('亮色')) {
    recommendations.push('彩色針織衫', '印花T恤', '彩色配件')
  } else {
    recommendations.push('基本款白T', '黑色西裝褲', '灰色毛衣')
  }

  if (occasionProfile.includes('職場')) {
    recommendations.push('商務套裝', '襯衫', '尖頭鞋')
  } else if (occasionProfile.includes('休閒')) {
    recommendations.push('休閒褲', '運動鞋', 'hoodie')
  }

  return {
    styleProfile,
    colorProfile,
    occasionProfile,
    shoppingProfile,
    recommendations: recommendations.slice(0, 8) // 限制推薦數量
  }
}

export async function POST(request: NextRequest) {
  try {
    const { memberId, email, preferences } = await request.json()
    
    if (!email || !preferences) {
      return NextResponse.json(
        { error: '電子郵件和偏好資料為必填' },
        { status: 400 }
      )
    }

    // 分析問卷結果
    const analysisResults = analyzePreferences(preferences)

    const preferencesData: FashionPreferences = {
      memberId: memberId || `member_${Date.now()}`,
      email,
      preferences,
      completedAt: new Date().toISOString(),
      analysisResults
    }

    // 儲存到模擬資料庫
    preferencesDatabase[email] = preferencesData
    
    console.log('問卷偏好已儲存:', {
      email,
      questionsAnswered: Object.keys(preferences).length,
      styleProfile: analysisResults.styleProfile
    })

    return NextResponse.json({
      success: true,
      message: '問卷結果已成功儲存',
      data: {
        analysisResults,
        completedAt: preferencesData.completedAt,
        questionsAnswered: Object.keys(preferences).length
      }
    })

  } catch (error) {
    console.error('儲存問卷偏好錯誤:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '儲存失敗，請稍後再試',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: '請提供電子郵件參數' },
        { status: 400 }
      )
    }

    const preferences = preferencesDatabase[email]
    
    if (!preferences) {
      return NextResponse.json(
        { error: '找不到問卷資料' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: preferences
    })

  } catch (error) {
    console.error('取得問卷偏好錯誤:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '取得資料失敗',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
}

// 根據問卷結果推薦商品
export async function POST_RECOMMENDATIONS(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: '請提供電子郵件' },
        { status: 400 }
      )
    }

    const preferences = preferencesDatabase[email]
    
    if (!preferences) {
      return NextResponse.json(
        { error: '找不到問卷資料' },
        { status: 404 }
      )
    }

    // 根據分析結果生成更詳細的推薦
    const { analysisResults } = preferences
    
    const detailedRecommendations = {
      immediateRecommendations: analysisResults?.recommendations || [],
      seasonalRecommendations: {
        spring: ['輕薄開衫', '碎花裙', '白色襯衫'],
        summer: ['無袖上衣', '短褲', '涼鞋'],
        autumn: ['針織毛衣', '風衣', '牛仔褲'],
        winter: ['羽絨外套', '厚針織', '長靴']
      },
      budgetRecommendations: {
        under1000: ['基本款T恤', '牛仔褲', '帆布鞋'],
        under3000: ['設計師襯衫', '韓系洋裝', '質感配件'],
        premium: ['精品外套', '絲質服飾', '名牌包包']
      },
      styleProfile: analysisResults?.styleProfile,
      nextSurveyDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 3個月後
    }

    return NextResponse.json({
      success: true,
      data: detailedRecommendations
    })

  } catch (error) {
    console.error('生成推薦錯誤:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '生成推薦失敗',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
}