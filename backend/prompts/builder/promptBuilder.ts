// backend/prompts/builder/promptBuilder.ts

import { IntentSummary } from '../../../frontend/lib/core/intentParser';
import { routeByIntent, RoutingDecision } from '../router/decision';
import { MASTER_SYSTEM_V12 } from '../master/system';
import { CARD_SAFETY_COMPLIANCE } from '../cards/safety/compliance';
import { CARD_MODE_ANALYZE_V11 } from '../cards/modes/analyze';
import { CARD_MODE_TREND_SUMMARY } from '../cards/modes/trend';
import { CARD_MODE_TRAVEL_PLAN } from '../cards/modes/travel';
import { CARD_MODE_RERANK } from '../cards/modes/rerank';
import { CARD_WEATHER_RULES } from '../cards/features/weather';
import { CARD_EXPERT_RAG } from '../cards/features/rag';
import { CARD_WEBSEARCH_SUMMARIZE, CARD_TREND_EXTRACTION } from '../cards/features/search';

export interface Envelope {
  intent: IntentSummary;
  weather_context?: any;
  weather_by_day?: any[];
  search_evidence?: any[];
  expert_rag?: {
    positive_rules: string[];
    negative_rules: string[];
    etiquette: string[];
    size_fit_hints: string[];
  };
  preferences?: {
    style_whitelist?: string[];
    occasions?: string[];
  };
  candidates?: any[];
  audit?: {
    warnings: string[];
    errors: string[];
    routing_notes: string[];
  };
}

export interface PromptMessages {
  messages: Array<{
    role: "system" | "developer" | "user";
    content: string;
  }>;
  routing: RoutingDecision;
  cards_used: string[];
  validation_errors: string[];
}

/**
 * 核心 Prompt Builder
 * 基於 Master System + Mode Cards + 嚴格路由 架構
 */
export function buildMessages(envelope: Envelope): PromptMessages {
  // 第1步：路由決策
  const routing = routeByIntent(envelope.intent);
  
  // 第2步：驗證路由一致性
  const validation_errors = validateRoutingConsistency(routing);
  
  // 第3步：選擇需要的卡片
  const cards: string[] = [];
  const cards_used: string[] = [];

  // 安全卡永遠注入（最高優先級）
  cards.push(CARD_SAFETY_COMPLIANCE);
  cards_used.push("SAFETY_COMPLIANCE@1.0");

  // 根據模式注入對應卡片
  switch (routing.mode) {
    case "analyze_and_recommend":
      cards.push(CARD_MODE_ANALYZE_V11);
      cards_used.push("MODE_ANALYZE_V11@1.1");
      break;
    
    case "trend_summary":
      cards.push(CARD_MODE_TREND_SUMMARY);
      cards_used.push("MODE_TREND@1.0");
      
      // 趨勢模式自動加入搜尋卡片
      if (routing.useWebSearch) {
        cards.push(CARD_WEBSEARCH_SUMMARIZE, CARD_TREND_EXTRACTION);
        cards_used.push("WEBSEARCH_SUMMARIZE@2.0", "TREND_EXTRACTION@1.1");
      }
      break;
    
    case "travel_plan":
      cards.push(CARD_MODE_TRAVEL_PLAN);
      cards_used.push("MODE_TRAVEL@1.0");
      break;
    
    case "rerank":
      cards.push(CARD_MODE_RERANK);
      cards_used.push("MODE_RERANK@1.0");
      break;
  }

  // 功能性卡片按需注入
  if (routing.useWeather && (envelope.weather_context || envelope.weather_by_day)) {
    cards.push(CARD_WEATHER_RULES);
    cards_used.push("WEATHER_RULES@2.0");
  }

  if (routing.useRAG && envelope.expert_rag) {
    cards.push(CARD_EXPERT_RAG);
    cards_used.push("EXPERT_RAG@1.0");
  }

  // 第4步：組裝 Messages
  const system_content = MASTER_SYSTEM_V12;
  const developer_content = cards.join("\n\n");
  const user_content = JSON.stringify(envelope, null, 2);

  // 第5步：添加路由資訊到 envelope.audit
  if (!envelope.audit) {
    envelope.audit = { warnings: [], errors: [], routing_notes: [] };
  }
  envelope.audit.routing_notes = [
    `mode: ${routing.mode}`,
    `useWeather: ${routing.useWeather}`,
    `useRAG: ${routing.useRAG}`,
    `useWebSearch: ${routing.useWebSearch}`,
    `cards: [${cards_used.join(", ")}]`,
    `reasons: [${routing.reasons.join(", ")}]`
  ];
  
  if (routing.warnings.length > 0) {
    envelope.audit.warnings.push(...routing.warnings);
  }

  return {
    messages: [
      { role: "system", content: system_content },
      { role: "developer", content: developer_content },
      { role: "user", content: JSON.stringify(envelope, null, 2) }
    ],
    routing,
    cards_used,
    validation_errors
  };
}

/**
 * 驗證路由與實際功能需求的一致性
 */
function validateRoutingConsistency(routing: RoutingDecision): string[] {
  const errors: string[] = [];

  // 規則檢查（從 decision.ts 導入）
  if (routing.mode === "travel_plan" && !routing.useWeather) {
    errors.push("INCONSISTENCY: travel_plan mode must use weather");
  }

  if (routing.mode === "trend_summary" && routing.useWeather) {
    errors.push("INCONSISTENCY: trend_summary mode cannot use weather");
  }

  if (routing.mode === "trend_summary" && !routing.useWebSearch) {
    errors.push("INCONSISTENCY: trend_summary mode must use web search");
  }

  if (routing.mode === "rerank" && (routing.useWeather || routing.useWebSearch)) {
    errors.push("INCONSISTENCY: rerank mode should not use weather or web search");
  }

  return errors;
}

/**
 * 簡化版 Builder（用於測試）
 */
export function buildSimpleMessage(
  mode: "analyze_and_recommend" | "trend_summary" | "travel_plan" | "rerank",
  text_query: string,
  options?: {
    weather?: boolean;
    rag?: boolean;
    search?: boolean;
    destinations?: string[];
    date_range?: any;
  }
): PromptMessages {
  const envelope: Envelope = {
    intent: {
      mode,
      text_query,
      destinations: options?.destinations,
      date_range: options?.date_range,
      needs_weather: options?.weather,
      needs_rag: options?.rag
    }
  };

  if (options?.weather) {
    envelope.weather_context = { temperature: 25, humidity: 60, conditions: "sunny" };
  }

  if (options?.rag) {
    envelope.expert_rag = {
      positive_rules: ["正式場合建議穿著整齊"],
      negative_rules: ["避免過於暴露的服裝"],
      etiquette: ["商務場合需要專業形象"],
      size_fit_hints: ["選擇合身但不緊身的版型"]
    };
  }

  if (options?.search) {
    envelope.search_evidence = [
      { title: "2025春夏流行趨勢", content: "極簡風格持續流行", url: "https://example.com" }
    ];
  }

  return buildMessages(envelope);
}

/**
 * 除錯用：列印 Messages 結構
 */
export function debugMessages(result: PromptMessages): void {
  console.log("=== ROUTING DECISION ===");
  console.log(`Mode: ${result.routing.mode}`);
  console.log(`Weather: ${result.routing.useWeather}`);
  console.log(`RAG: ${result.routing.useRAG}`);
  console.log(`WebSearch: ${result.routing.useWebSearch}`);
  console.log(`Reasons: ${result.routing.reasons.join(", ")}`);
  
  if (result.routing.warnings.length > 0) {
    console.log(`Warnings: ${result.routing.warnings.join(", ")}`);
  }

  console.log("\n=== CARDS USED ===");
  result.cards_used.forEach(card => console.log(`- ${card}`));

  if (result.validation_errors.length > 0) {
    console.log("\n=== VALIDATION ERRORS ===");
    result.validation_errors.forEach(error => console.log(`❌ ${error}`));
  }

  console.log("\n=== MESSAGE STRUCTURE ===");
  result.messages.forEach((msg, i) => {
    console.log(`${i + 1}. ${msg.role.toUpperCase()}: ${msg.content.substring(0, 100)}...`);
  });
}

export default { buildMessages, buildSimpleMessage, debugMessages };