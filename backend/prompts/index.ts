// backend/prompts/index.ts

/**
 * STYLEMATE Prompts 系統主入口
 * 
 * 基於 Master System + Mode Cards + 嚴格路由 架構
 * 確保多提示詞不會互相衝突的完整解決方案
 */

// 主要 API
export { buildMessages, buildSimpleMessage, debugMessages } from './builder/promptBuilder';
export { routeByIntent, validateRouting } from './router/decision';

// 類型定義
export type { Envelope, PromptMessages } from './builder/promptBuilder';
export type { Mode, RoutingDecision } from './router/decision';

// Master System
export { MASTER_SYSTEM_V12 } from './master/system';

// Mode Cards
export { CARD_MODE_ANALYZE_V11 } from './cards/modes/analyze';
export { CARD_MODE_TREND_SUMMARY } from './cards/modes/trend';
export { CARD_MODE_TRAVEL_PLAN } from './cards/modes/travel';
export { CARD_MODE_RERANK } from './cards/modes/rerank';

// Feature Cards
export { CARD_WEATHER_RULES } from './cards/features/weather';
export { CARD_EXPERT_RAG } from './cards/features/rag';
export { CARD_WEBSEARCH_SUMMARIZE, CARD_TREND_EXTRACTION } from './cards/features/search';

// Safety & Compliance
export { CARD_SAFETY_COMPLIANCE } from './cards/safety/compliance';

// 測試工具
export { TEST_CASES } from './router/decision';

/**
 * 快捷使用範例
 */
export const examples = {
  /**
   * 基本穿搭建議
   */
  basicOutfit: () => buildSimpleMessage("analyze_and_recommend", "適合約會的洋裝"),
  
  /**
   * 流行趨勢查詢（自動啟用 WebSearch）
   */
  trendSummary: () => buildSimpleMessage("trend_summary", "2025年韓國流行趨勢"),
  
  /**
   * 旅行規劃（自動啟用天氣）
   */
  travelPlan: () => buildSimpleMessage("travel_plan", "東京5天旅遊", {
    destinations: ["Tokyo, JP"],
    date_range: { start: "2025-09-20", end: "2025-09-25" },
    weather: true
  }),
  
  /**
   * 商品重排
   */
  rerank: () => buildSimpleMessage("rerank", "重排這幾件商品"),
  
  /**
   * 複合需求（地點 + 時間 + 天氣）
   */
  weatherOutfit: () => buildSimpleMessage("analyze_and_recommend", "明天去台北穿什麼", {
    weather: true,
    destinations: ["Taipei, TW"],
    date_range: { start: "2025-09-20", end: "2025-09-20" }
  }),
  
  /**
   * 正式場合（自動啟用 RAG）
   */
  formalEvent: () => buildSimpleMessage("analyze_and_recommend", "參加婚禮穿搭建議", {
    rag: true
  })
};

/**
 * 版本資訊
 */
export const version = {
  system: "1.2",
  cards: {
    analyze: "1.1",
    trend: "1.0",
    travel: "1.0", 
    rerank: "1.0",
    weather: "2.0",
    rag: "1.0",
    search: "2.0",
    safety: "1.0"
  },
  router: "1.0",
  builder: "1.0"
};

export default {
  buildMessages,
  buildSimpleMessage,
  routeByIntent,
  examples,
  version
};