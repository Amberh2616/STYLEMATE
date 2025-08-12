import { NextRequest, NextResponse } from 'next/server'
import { products } from '@/lib/products'
import OpenAI from 'openai'

// 初始化 OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
})

// AI 商品分析 API
export async function POST(request: NextRequest) {
  try {
    const { productId, userPreferences, context } = await request.json()

    // 獲取商品資訊
    const product = products.find(p => p.id === productId)
    if (!product) {
      return NextResponse.json(
        { success: false, message: '商品不存在' },
        { status: 404 }
      )
    }

    // 使用 OpenAI 進行真實 AI 分析
    const aiAnalysis = await analyzeProductWithOpenAI(product, userPreferences, context)

    // 結合傳統分析和 AI 分析
    const analysis = {
      compatibility: calculateCompatibility(product, userPreferences),
      recommendations: aiAnalysis.recommendations || generateRecommendations(product, userPreferences),
      styling_tips: aiAnalysis.styling_tips || generateStylingTips(product),
      occasion_match: analyzeOccasionMatch(product, context),
      size_recommendation: recommendSize(userPreferences?.measurements),
      color_analysis: analyzeColorMatch(product, userPreferences?.skin_tone),
      ai_insights: aiAnalysis.insights // 新增 AI 洞察
    }

    return NextResponse.json({
      success: true,
      data: {
        product: {
          id: product.id,
          name: product.name,
          tags: product.tags,
          aiMetadata: product.aiMetadata
        },
        analysis,
        confidence: analysis.compatibility / 100
      }
    })

  } catch (error) {
    console.error('AI 分析錯誤:', error)
    return NextResponse.json(
      { success: false, message: 'AI 分析失敗' },
      { status: 500 }
    )
  }
}

// OpenAI 分析函數
async function analyzeProductWithOpenAI(product: any, userPreferences: any, context: string) {
  try {
    const prompt = `
你是一位專業的韓式時尚顧問，請分析以下商品並提供專業建議：

商品資訊：
- 名稱：${product.name}
- 價格：NT$ ${product.price}
- 類別：${product.category}
- 風格：${product.style}
- 描述：${product.description}
- 標籤：${product.tags.join('、')}
- 場合：${product.aiMetadata.occasion.join('、')}
- 季節：${product.aiMetadata.season.join('、')}
- 特色：${product.aiMetadata.features.join('、')}
- 材質：${product.aiMetadata.material}
- 版型：${product.aiMetadata.fit}

用戶偏好：
- 喜愛風格：${userPreferences?.preferred_styles?.join('、') || '未知'}
- 使用場合：${context}
- 身材資訊：${userPreferences?.measurements ? `胸圍${userPreferences.measurements.bust}cm, 腰圍${userPreferences.measurements.waist}cm, 身高${userPreferences.measurements.height}cm` : '未提供'}

請以專業時尚顧問的角度分析，並用繁體中文回答：

1. 推薦理由（3-5個要點）
2. 穿搭建議（具體的搭配建議）
3. 專業洞察（關於這件商品的時尚見解）

請用 JSON 格式回答：
{
  "recommendations": ["理由1", "理由2", "理由3"],
  "styling_tips": ["建議1", "建議2", "建議3"],
  "insights": "專業洞察內容"
}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "你是一位專業的韓式時尚顧問，擅長分析服裝並提供個人化建議。請用溫暖、專業的語調回答。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const aiResponse = completion.choices[0]?.message?.content
    
    if (aiResponse) {
      try {
        return JSON.parse(aiResponse)
      } catch (parseError) {
        console.error('解析 AI 回應失敗:', parseError)
        return {
          recommendations: ["AI 分析暫時無法解析，使用備用建議"],
          styling_tips: ["建議參考商品標籤進行搭配"],
          insights: "專業 AI 分析功能正在優化中"
        }
      }
    }
    
    return {
      recommendations: ["OpenAI 回應為空"],
      styling_tips: ["請稍後再試"],
      insights: "AI 分析暫時無法使用"
    }

  } catch (error) {
    console.error('OpenAI API 錯誤:', error)
    return {
      recommendations: ["AI 分析暫時無法使用，採用基礎分析"],
      styling_tips: ["建議參考商品描述"],
      insights: "系統正在連接 AI 服務"
    }
  }
}

// 計算適配度 (0-100)
function calculateCompatibility(product: any, userPreferences: any) {
  let score = 70 // 基礎分數
  
  // 根據標籤匹配度計算
  if (userPreferences?.preferred_styles) {
    const styleMatches = product.tags.filter((tag: string) => 
      userPreferences.preferred_styles.includes(tag)
    ).length
    score += styleMatches * 10
  }
  
  // 根據場合匹配度
  if (userPreferences?.occasions) {
    const occasionMatches = product.aiMetadata.occasion.filter((occ: string) => 
      userPreferences.occasions.includes(occ)
    ).length
    score += occasionMatches * 5
  }
  
  return Math.min(100, score)
}

// 生成推薦理由
function generateRecommendations(product: any, userPreferences: any) {
  const reasons = []
  
  if (product.tags.includes('韓系')) {
    reasons.push('符合韓式時尚風格，展現優雅氣質')
  }
  
  if (product.tags.includes('百搭')) {
    reasons.push('百搭設計，可以搭配多種單品')
  }
  
  if (product.aiMetadata.features.includes('comfortable')) {
    reasons.push('舒適面料，穿著體驗佳')
  }
  
  if (product.isSale) {
    reasons.push(`特價優惠中，現省 NT$ ${product.originalPrice - product.price}`)
  }
  
  return reasons.slice(0, 3) // 最多返回3個理由
}

// 生成穿搭建議
function generateStylingTips(product: any) {
  const tips = []
  
  if (product.category === 'dress') {
    tips.push('可搭配小外套和高跟鞋，打造優雅造型')
    tips.push('配上精緻配件，適合約會或正式場合')
  } else if (product.category === 'top') {
    tips.push('可搭配高腰褲或裙子，展現好身材比例')
    tips.push('層次搭配外套，增添時尚感')
  } else if (product.category === 'set') {
    tips.push('套裝搭配，省時又好看')
    tips.push('可拆開單穿，一衣多穿更實用')
  }
  
  return tips
}

// 分析場合匹配度
function analyzeOccasionMatch(product: any, context: string) {
  const matches = []
  
  if (context === 'work' && product.aiMetadata.occasion.includes('work')) {
    matches.push({ occasion: '工作場合', match: true, reason: '專業正式，適合職場' })
  }
  
  if (context === 'date' && product.aiMetadata.occasion.includes('date')) {
    matches.push({ occasion: '約會場合', match: true, reason: '優雅浪漫，增添魅力' })
  }
  
  if (context === 'casual' && product.aiMetadata.occasion.includes('casual')) {
    matches.push({ occasion: '日常休閒', match: true, reason: '舒適自在，適合日常' })
  }
  
  return matches
}

// 推薦尺寸
function recommendSize(measurements: any) {
  if (!measurements) {
    return { size: 'M', reason: '根據一般體型推薦' }
  }
  
  // 簡單的尺寸推薦邏輯
  const { bust, waist, height } = measurements
  
  if (bust < 82 || waist < 62) return { size: 'S', reason: '根據您的身材推薦' }
  if (bust > 92 || waist > 72) return { size: 'L', reason: '根據您的身材推薦' }
  return { size: 'M', reason: '根據您的身材推薦' }
}

// 分析顏色搭配
function analyzeColorMatch(product: any, skinTone: string) {
  if (!skinTone) return { match: true, reason: '顏色搭配良好' }
  
  // 簡單的膚色搭配建議
  const recommendations = []
  
  if (skinTone === 'cool' && product.colors?.includes('黑色')) {
    recommendations.push('黑色很適合您的冷色調膚色')
  }
  
  if (skinTone === 'warm' && product.colors?.includes('米色')) {
    recommendations.push('米色很適合您的暖色調膚色')
  }
  
  return {
    match: true,
    recommendations: recommendations.length > 0 ? recommendations : ['顏色搭配很棒！']
  }
}