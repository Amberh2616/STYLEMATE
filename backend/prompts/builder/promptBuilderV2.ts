// backend/prompts/builder/promptBuilderV2.ts

import { IntentSummary } from '../../../frontend/lib/core/intentParser';
import { CORE_SYSTEM_PROMPT } from '../core/system';
import { getCardsForIntent } from '../selector/cardSelector';
import { compressEvidence, evidenceToString } from '../compression/evidenceCompressor';

export interface OptimizedPrompt {
  messages: Array<{
    role: "system" | "user";
    content: string;
  }>;
  metadata: {
    corePromptLength: number;
    cardsLength: number;
    evidenceLength: number;
    totalTokens: number;
    cardsUsed: string[];
    compressionRatio: number;
  };
}

/**
 * 新版 Prompt Builder - 瘦身版
 * 核心 200字 + 卡片 ≤500字 + 證據包 ≤600字 = 總計 ≤1300字
 */
export function buildOptimizedPrompt(data: {
  intent: IntentSummary;
  userMessage: string;
  fashionItems?: any[];
  weatherContext?: any;
  trendContext?: string;
  ragContext?: any[];
  memberPreferences?: any;
  hasImage?: boolean;
}): OptimizedPrompt {

  // 1. 核心系統提示詞 (200字)
  const corePrompt = CORE_SYSTEM_PROMPT;
  
  // 2. 按需選擇卡片 (≤500字)
  const cardsResult = getCardsForIntent(
    data.intent, 
    !!data.weatherContext || data.intent.needs_weather,
    !!data.hasImage
  );
  
  // 3. 壓縮證據包 (≤600字)
  const compressedEvidence = compressEvidence({
    fashionItems: data.fashionItems,
    weatherContext: data.weatherContext,
    trendContext: data.trendContext,
    ragContext: data.ragContext,
    userConstraints: [
      data.memberPreferences ? `用戶偏好資料: ${JSON.stringify(data.memberPreferences)}` : null
    ].filter(Boolean)
  });
  
  // 4. 組裝 user message
  const userContent = [
    `**用戶查詢:** ${data.userMessage}`,
    '',
    '**可用資源:**',
    evidenceToString(compressedEvidence)
  ].join('\n');
  
  // 5. 計算長度統計
  const coreLength = corePrompt.length;
  const cardsLength = cardsResult.content.length;
  const evidenceLength = userContent.length;
  const totalTokens = Math.ceil((coreLength + cardsLength + evidenceLength) / 4); // 粗略估算
  
  return {
    messages: [
      {
        role: "system",
        content: `${corePrompt}\n\n---\n\n${cardsResult.content}`
      },
      {
        role: "user", 
        content: userContent
      }
    ],
    metadata: {
      corePromptLength: coreLength,
      cardsLength: cardsLength,
      evidenceLength: evidenceLength,
      totalTokens,
      cardsUsed: cardsResult.metadata.cardNames,
      compressionRatio: compressedEvidence.metadata.compressionRatio
    }
  };
}

/**
 * 除錯用：輸出 Prompt 統計
 */
export function debugOptimizedPrompt(prompt: OptimizedPrompt): void {
  console.log('\n=== OPTIMIZED PROMPT STATS ===');
  console.log(`Core Prompt: ${prompt.metadata.corePromptLength} chars`);
  console.log(`Cards: ${prompt.metadata.cardsLength} chars`);
  console.log(`Evidence: ${prompt.metadata.evidenceLength} chars`);
  console.log(`Total Tokens: ~${prompt.metadata.totalTokens}`);
  console.log(`Cards Used: [${prompt.metadata.cardsUsed.join(', ')}]`);
  console.log(`Compression: ${(prompt.metadata.compressionRatio * 100).toFixed(1)}%`);
  
  if (prompt.metadata.totalTokens > 1500) {
    console.log('⚠️ WARNING: Token count exceeds target (1500)');
  } else {
    console.log('✅ Token count within target');
  }
}

/**
 * 簡化版：快速建立優化提示詞
 */
export function quickBuild(
  intent: IntentSummary,
  userMessage: string,
  context?: {
    items?: any[];
    weather?: any;
    trends?: string;
  }
): OptimizedPrompt {
  return buildOptimizedPrompt({
    intent,
    userMessage,
    fashionItems: context?.items,
    weatherContext: context?.weather,
    trendContext: context?.trends
  });
}

export default { buildOptimizedPrompt, debugOptimizedPrompt, quickBuild };