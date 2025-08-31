// backend/prompts/config/responseLimits.ts

/**
 * 回覆字數限制配置
 */
export interface ResponseLimit {
  min: number;
  max: number;
  description: string;
  includes: string[];
}

export const RESPONSE_LIMITS: Record<string, ResponseLimit> = {
  // 基本商品推薦回覆
  product_recommendation: {
    min: 300,
    max: 500,
    description: "商品推薦與分析",
    includes: ["分析", "推薦理由", "商品建議"]
  },
  
  // 天氣穿搭建議回覆
  weather_styling: {
    min: 400,
    max: 700,
    description: "天氣相關穿搭建議",
    includes: ["天氣分析", "材質建議", "場合搭配", "完整商品名稱（不得修改）"]
  },
  
  // 趨勢分析回覆
  trend_analysis: {
    min: 450,
    max: 600,
    description: "時尚趨勢分析",
    includes: ["趨勢引用", "專業分析", "實際應用建議"]
  },
  
  // 圖片分析回覆
  image_analysis: {
    min: 250,
    max: 600,
    description: "圖片服裝分析",
    includes: ["服裝分析", "風格判斷", "搭配建議"]
  },
  
  // 一般聊天回覆
  general_chat: {
    min: 150,
    max: 300,
    description: "一般對話與引導",
    includes: ["理解確認", "簡要建議"]
  }
};

/**
 * 根據模式獲取字數限制
 */
export function getResponseLimit(mode: string): ResponseLimit {
  return RESPONSE_LIMITS[mode] || RESPONSE_LIMITS.general_chat;
}

/**
 * 生成字數限制提示文字
 */
export function generateLimitPrompt(mode: string): string {
  const limit = getResponseLimit(mode);
  return `回覆字數：${limit.min}-${limit.max}字。包含：${limit.includes.join('、')}。`;
}

export default { RESPONSE_LIMITS, getResponseLimit, generateLimitPrompt };