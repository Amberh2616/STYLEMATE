// backend/prompts/router/decision.ts

import { IntentSummary } from '../../../frontend/lib/core/intentParser';

export type Mode = "travel_plan" | "trend_summary" | "analyze_and_recommend" | "rerank";

export interface RoutingDecision {
  mode: Mode;
  useWeather: boolean;
  useRAG: boolean;
  useWebSearch: boolean;
  reasons: string[];
  warnings: string[];
}

/**
 * 核心路由決策器
 * 基於決策表和決策樹實作，確保互斥且可預測
 */
export function routeByIntent(intent: IntentSummary): RoutingDecision {
  const reasons: string[] = [];
  const warnings: string[] = [];

  // 決策樹第一層：明確模式檢查
  if (intent.mode === "rerank") {
    reasons.push("explicit_rerank_mode");
    return {
      mode: "rerank",
      useWeather: false,
      useRAG: false,
      useWebSearch: false,
      reasons,
      warnings
    };
  }

  // 決策樹第二層：旅行判定（最高優先級）
  const hasTrip = !!(intent.destinations?.length) && !!intent.date_range;
  if (hasTrip) {
    reasons.push("trip_detected", `destinations: ${intent.destinations}`, `date_range: ${JSON.stringify(intent.date_range)}`);
    return {
      mode: "travel_plan",
      useWeather: true,  // 旅行模式自動需要天氣
      useRAG: !!intent.needs_rag,
      useWebSearch: false,  // 旅行規劃不需要 web search
      reasons,
      warnings
    };
  }

  // 決策樹第三層：趨勢判定（第二優先級）
  const isTrend = checkTrendKeywords(intent.text_query || "");
  if (isTrend) {
    reasons.push("trend_keywords_detected");
    return {
      mode: "trend_summary",
      useWeather: false,  // 趨勢摘要永遠不查天氣
      useRAG: false,      // 趨勢摘要不使用 RAG
      useWebSearch: true, // 趨勢摘要需要 web search
      reasons,
      warnings
    };
  }

  // 決策樹第四層：穿搭建議模式（預設）
  const hasLocationAndTime = !!(intent.destinations?.length && intent.date_range);
  const hasClothingQuery = checkClothingQuery(intent.text_query || "");
  
  if (hasLocationAndTime && hasClothingQuery) {
    reasons.push("location_and_date_present", "clothing_query_detected");
    return {
      mode: "analyze_and_recommend",
      useWeather: true,   // 有地點和時間的穿搭查詢需要天氣
      useRAG: !!intent.needs_rag,
      useWebSearch: false,
      reasons,
      warnings
    };
  }

  // 邊界情況處理
  if (intent.destinations?.length && !intent.date_range) {
    warnings.push("location_without_date_range");
  }
  if (intent.date_range && !intent.destinations?.length) {
    warnings.push("date_range_without_location");
  }

  reasons.push("default_analyze_mode");
  return {
    mode: "analyze_and_recommend",
    useWeather: false,  // 預設穿搭模式不查天氣
    useRAG: !!intent.needs_rag,
    useWebSearch: false,
    reasons,
    warnings
  };
}

/**
 * 檢查是否為趨勢查詢
 */
function checkTrendKeywords(text: string): boolean {
  const trendPatterns = [
    /趨勢|流行|本季|今年|熱門|關鍵色/i,
    /時裝周|fashion\s*week/i,
    /巴黎時裝周|紐約時裝周|米蘭時裝周|倫敦時裝周/i,
    /何時.*時裝周|什麼時候.*時裝周/i
  ];
  
  return trendPatterns.some(pattern => pattern.test(text));
}

/**
 * 檢查是否為穿搭查詢
 */
function checkClothingQuery(text: string): boolean {
  const clothingPatterns = [
    /穿|搭配|服裝|衣服/i,
    /what.*wear|outfit|clothing/i,
    /上衣|下裝|外套|鞋子|配件/i
  ];
  
  return clothingPatterns.some(pattern => pattern.test(text));
}

/**
 * 驗證路由決策的一致性
 */
export function validateRouting(decision: RoutingDecision): string[] {
  const errors: string[] = [];

  // 規則1：travel_plan 必須查天氣
  if (decision.mode === "travel_plan" && !decision.useWeather) {
    errors.push("travel_plan mode must use weather");
  }

  // 規則2：trend_summary 不能查天氣
  if (decision.mode === "trend_summary" && decision.useWeather) {
    errors.push("trend_summary mode cannot use weather");
  }

  // 規則3：trend_summary 必須使用 WebSearch
  if (decision.mode === "trend_summary" && !decision.useWebSearch) {
    errors.push("trend_summary mode must use web search");
  }

  // 規則4：rerank 不使用天氣或搜尋
  if (decision.mode === "rerank" && (decision.useWeather || decision.useWebSearch)) {
    errors.push("rerank mode should not use weather or web search");
  }

  return errors;
}

/**
 * 10 條單元測試案例（從用戶需求轉換）
 */
export const TEST_CASES = [
  {
    name: "9/20~9/24 去首爾穿什麼",
    intent: {
      mode: "analyze_and_recommend" as const,
      text_query: "9/20~9/24 去首爾穿什麼",
      destinations: ["Seoul, KR"],
      date_range: { start: "2025-09-20", end: "2025-09-24" }
    },
    expected: { mode: "travel_plan", useWeather: true }
  },
  {
    name: "今年日韓趨勢",
    intent: {
      mode: "analyze_and_recommend" as const,
      text_query: "今年日韓趨勢"
    },
    expected: { mode: "trend_summary", useWeather: false }
  },
  {
    name: "海邊婚禮穿搭",
    intent: {
      mode: "analyze_and_recommend" as const,
      text_query: "海邊婚禮穿搭"
    },
    expected: { mode: "analyze_and_recommend", useWeather: false }
  },
  {
    name: "台北週末要穿什麼（無日期）",
    intent: {
      mode: "analyze_and_recommend" as const,
      text_query: "台北週末要穿什麼",
      destinations: ["Taipei, TW"]
    },
    expected: { mode: "analyze_and_recommend", useWeather: false }
  },
  {
    name: "東京 9/22 參加婚禮穿搭",
    intent: {
      mode: "analyze_and_recommend" as const,
      text_query: "東京 9/22 參加婚禮穿搭",
      destinations: ["Tokyo, JP"],
      date_range: { start: "2025-09-22", end: "2025-09-22" }
    },
    expected: { mode: "analyze_and_recommend", useWeather: true }
  },
  {
    name: "去巴黎玩5天需要穿什麼今年流行是什麼",
    intent: {
      mode: "analyze_and_recommend" as const,
      text_query: "去巴黎玩5天需要穿什麼今年流行是什麼",
      destinations: ["Paris, FR"],
      date_range: { start: "AUTO_TODAY", end: "+5d" }
    },
    expected: { mode: "travel_plan", useWeather: true }  // 旅行優先於趨勢
  },
  {
    name: "東京時裝周趨勢",
    intent: {
      mode: "analyze_and_recommend" as const,
      text_query: "東京時裝周趨勢"
    },
    expected: { mode: "trend_summary", useWeather: false }
  },
  {
    name: "重排這幾件",
    intent: {
      mode: "rerank" as const,
      text_query: "重排這幾件"
    },
    expected: { mode: "rerank", useWeather: false }
  },
  {
    name: "問天氣但無地點",
    intent: {
      mode: "analyze_and_recommend" as const,
      text_query: "今天天氣適合穿什麼"
    },
    expected: { mode: "analyze_and_recommend", useWeather: false }
  },
  {
    name: "兩個城市",
    intent: {
      mode: "analyze_and_recommend" as const,
      text_query: "東京和首爾穿搭",
      destinations: ["Tokyo, JP", "Seoul, KR"]
    },
    expected: { mode: "analyze_and_recommend", useWeather: false }
  }
];

export default { routeByIntent, validateRouting, TEST_CASES };