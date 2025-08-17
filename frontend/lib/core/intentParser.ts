// frontend/lib/core/intentParser.ts
import { MODE_KEYWORDS, OCCASION_HINTS, NEEDS_RAG_HINTS, CITY_WHITELIST, COUNTRY_TO_CITY } from "./intentRules";

export type Occasion = "通勤"|"正式"|"休閒"|"約會"|"旅遊"|"商務簡報"|"派對";

export type IntentSummary = {
  mode: "analyze_and_recommend" | "trend_summary" | "travel_plan" | "rerank";
  text_query?: string;
  has_image?: boolean;
  needs_weather?: boolean;
  needs_rag?: boolean;
  destinations?: string[];
  date_range?: { start: string; end: string };
  occasions?: Occasion[];
};

type Input = {
  text: string;
  images?: { type: "full_body"|"reference"; url: string }[];
  // 可選：若前端已先解析地點/日期可傳入
  preset?: { destinations?: string[]; date_range?: { start: string; end: string } };
};

const hasAny = (text: string, patterns: (RegExp)[]) => patterns.some(rx => rx.test(text));

function detectMode(text: string): IntentSummary["mode"] {
  // 1. 優先檢查明確的功能詞彙
  if (hasAny(text, MODE_KEYWORDS.rerank)) return "rerank";
  
  // 2. 檢查時裝週/趨勢 - 最高優先級，因為這些是專業術語
  if (hasAny(text, MODE_KEYWORDS.trend_summary)) return "trend_summary";
  
  // 3. 檢查旅行規劃 - 但需要更嚴格的上下文判斷
  if (isActualTravelQuery(text)) return "travel_plan";
  
  return "analyze_and_recommend";
}

// 更精確的旅行查詢判斷
function isActualTravelQuery(text: string): boolean {
  // 🚫 時裝周語境排除：如果提到時裝周，絕對不是旅行查詢
  const isFashionContext = /時裝周|fashion week|服裝周|流行|趨勢|時尚周/i.test(text);
  if (isFashionContext) return false;
  
  // 強旅行信號 - 明確的旅行動詞，即使有穿搭詞彙也算旅行
  const strongTravelSignals = /旅行|旅遊|出差|行程|幫我查天氣|天氣預報/i;
  if (strongTravelSignals.test(text)) return true;
  
  // 弱旅行信號 - 需要更多條件
  const hasDuration = /\b(\d{1,2})\s*(天|day|days)\b/i.test(text);
  const hasLocation = extractDestination(text);
  const isClothingQuery = /穿|搭配|服裝|衣服|what.*wear/i.test(text);
  
  // 地點+時間+穿搭 = 旅行穿搭查詢，應該要天氣
  if (hasDuration && hasLocation && isClothingQuery) {
    return true;
  }
  
  // 只有地點+時間但沒穿搭詞彙的，也可能是旅行
  if (hasDuration && hasLocation) {
    return true;
  }
  
  return false;
}

function extractOccasions(text: string): Occasion[] {
  const out = new Set<Occasion>();
  OCCASION_HINTS.forEach(({ rx, val }) => { if (rx.test(text)) out.add(val as Occasion); });
  return Array.from(out);
}

// 極簡地點/日期解析：先吃 preset，再做白名單 Fuzzy（可換成 NER/Geo API）
function extractDestination(text: string, preset?: string[]): string[] | undefined {
  if (preset && preset.length) return preset;
  
  // 1. 先檢查國家名稱對應
  const countryMatches = [];
  for (const [country, city] of Object.entries(COUNTRY_TO_CITY)) {
    if (new RegExp(country, "i").test(text)) {
      countryMatches.push(city);
    }
  }
  if (countryMatches.length) return countryMatches;
  
  // 2. 再檢查城市白名單
  const hits = CITY_WHITELIST.filter(c => {
    const [city] = c.split(", ");
    const alias = city.replace(/[ -]/g, "");
    // 更寬鬆的地點匹配 - 不需要「去」字
    return new RegExp(city, "i").test(text) || new RegExp(alias, "i").test(text);
  });
  return hits.length ? hits : undefined;
}

function extractDateRange(text: string, preset?: { start: string; end: string }) {
  if (preset) return preset;
  // 簡化：抓「YYYY-MM-DD ~ YYYY-MM-DD」；實務建議用 chrono-node
  const m = text.match(/(\d{4}-\d{1,2}-\d{1,2})\s*[~\-至to]\s*(\d{4}-\d{1,2}-\d{1,2})/i);
  if (m) return { start: m[1], end: m[2] };
  // 若只有「X天」→ 以今日為 start（交給後端補齊）
  const d = text.match(/(\d{1,2})\s*(天|days?)/i);
  if (d) return { start: "AUTO_TODAY", end: `+${d[1]}d` };
  return undefined;
}

export function analyzeIntent(input: Input): IntentSummary {
  const text = input.text || "";
  const mode = detectMode(text);
  const occasions = extractOccasions(text);
  const needs_rag = NEEDS_RAG_HINTS.some(rx => rx.test(text)) || occasions.includes("正式");
  const destinations = extractDestination(text, input.preset?.destinations);
  const date_range = extractDateRange(text, input.preset?.date_range);

  const needs_weather =
    mode === "travel_plan" ||
    /天氣|下雨|UV|紫外線|風大|冷|熱|查天氣|天氣預報/i.test(text) ||
    // 只有穿搭查詢且有地點+時間才需要天氣，趨勢查詢不需要
    (mode === "analyze_and_recommend" && !!destinations && (!!date_range || /\d+天|天數|幾天/i.test(text)) && /穿|搭配|服裝|衣服/i.test(text));

  return {
    mode,
    text_query: text.trim(),
    has_image: !!input.images?.length,
    needs_weather,
    needs_rag,
    destinations,
    date_range,
    occasions: occasions.length ? occasions : undefined
  };
}