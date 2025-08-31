// backend/prompts/selector/cardSelector.ts

import { IntentSummary } from '../../../frontend/lib/core/intentParser';
import { CARD_STYLE_RULES } from '../cards/style/styleRules';
import { CARD_WEATHER_ENHANCED } from '../cards/weather/weatherRules';
import { CARD_OUTPUT_FORMAT } from '../cards/format/outputFormat';
import { CARD_MODE_RERANK } from '../cards/modes/rerank';
import { CARD_MODE_ANALYZE_V11 } from '../cards/modes/analyze';
import { CARD_MODE_TRAVEL_PLAN } from '../cards/modes/travel';
import { CARD_MODE_TREND_SUMMARY } from '../cards/modes/trend';
import { CARD_EXPERT_RAG } from '../cards/features/rag';
import { generateLimitPrompt } from '../config/responseLimits';

export interface SelectedCards {
  cards: string[];
  cardNames: string[];
  totalLength: number;
}

/**
 * 根據 Intent 分析結果選擇需要的卡片
 */
export function selectCards(intent: IntentSummary, hasWeather: boolean = false, hasImage: boolean = false): SelectedCards {
  const cards: string[] = [];
  const cardNames: string[] = [];

  // 1. 格式卡片 - 永遠包含
  cards.push(CARD_OUTPUT_FORMAT);
  cardNames.push("OUTPUT_FORMAT");

  // 2. 風格規則卡片 - 商品推薦時包含
  if (intent.mode === 'analyze_and_recommend') {
    cards.push(CARD_STYLE_RULES);
    cardNames.push("STYLE_RULES");
  }

  // 2.1 RERANK 模式卡片 - 重新排序時包含
  if (intent.mode === 'rerank') {
    cards.push(CARD_MODE_RERANK);
    cardNames.push("MODE_RERANK");
  }

  // 3. 天氣卡片 - 有天氣資訊時包含
  if (hasWeather || intent.needs_weather) {
    cards.push(CARD_WEATHER_ENHANCED);
    cardNames.push("WEATHER_ENHANCED");
  }

  // 4. 字數限制提示
  let responseMode = 'general_chat'; // 預設
  
  if (hasImage) {
    responseMode = 'image_analysis';
  } else if (intent.mode === 'trend_summary') {
    responseMode = 'trend_analysis';
  } else if (hasWeather || intent.needs_weather) {
    responseMode = 'weather_styling';
  } else if (intent.mode === 'analyze_and_recommend') {
    responseMode = 'product_recommendation';
  }

  const limitPrompt = generateLimitPrompt(responseMode);
  cards.push(`**字數限制：**\n${limitPrompt}`);
  cardNames.push(`LIMIT_${responseMode.toUpperCase()}`);

  // 計算總長度（估算）
  const totalLength = cards.join('\n\n').length;

  return {
    cards,
    cardNames,
    totalLength
  };
}

/**
 * 組合卡片內容
 */
export function combineCards(selectedCards: SelectedCards): string {
  return selectedCards.cards.join('\n\n---\n\n');
}

/**
 * 一鍵獲取組合後的卡片內容
 */
export function getCardsForIntent(
  intent: IntentSummary, 
  hasWeather: boolean = false, 
  hasImage: boolean = false
): { content: string; metadata: SelectedCards } {
  const selected = selectCards(intent, hasWeather, hasImage);
  const content = combineCards(selected);
  
  return {
    content,
    metadata: selected
  };
}

export default { selectCards, combineCards, getCardsForIntent };