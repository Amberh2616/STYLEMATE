// backend/prompts/compression/evidenceCompressor.ts

/**
 * 證據包壓縮器 - 將大量資料壓縮成 ≤600 tokens
 */

export interface CompressedEvidence {
  candidates: any[];
  weather_context?: string;
  trend_context?: string;
  rag_context?: string;
  constraints: string[];
  metadata: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  };
}

/**
 * 壓縮商品候選列表
 */
function compressCandidates(items: any[], limit: number = 6): any[] {
  if (!items || items.length === 0) return [];
  
  // 只保留關鍵欄位，移除冗餘資訊
  return items.slice(0, limit).map(item => ({
    id: item.id,
    name: item.name_zh || item.name || item.name_en,
    category: item.category_zh || item.category || item.category_en,
    price: item.price_twd || item.price,
    tags: Array.isArray(item.style_tags_zh) ? item.style_tags_zh.slice(0, 3) : [],
    occasions: Array.isArray(item.occasion_zh) ? item.occasion_zh.slice(0, 2) : []
  }));
}

/**
 * 壓縮天氣資訊
 */
function compressWeatherContext(weatherData: any): string {
  if (!weatherData) return '';
  
  // 如果是字符串（已格式化的天氣內容），直接返回但進行適度壓縮
  if (typeof weatherData === 'string') {
    // 保留完整的預格式化天氣內容，因為它已經包含重要的穿搭建議
    return weatherData;
  }
  
  // 如果是結構化對象，提取關鍵天氣資訊
  const essential = [];
  
  if (weatherData.temperature) {
    essential.push(`溫度: ${weatherData.temperature}°C`);
  }
  
  if (weatherData.conditions) {
    essential.push(`天況: ${weatherData.conditions}`);
  }
  
  if (weatherData.humidity) {
    essential.push(`濕度: ${weatherData.humidity}%`);
  }
  
  if (weatherData.precipitation) {
    essential.push(`降雨: ${weatherData.precipitation}%`);
  }
  
  return essential.join(', ');
}

/**
 * 壓縮趨勢資訊
 */
function compressTrendContext(trendData: string): string {
  if (!trendData || trendData.length <= 200) return trendData;
  
  // 簡化趨勢資訊，保留關鍵點
  const lines = trendData.split('\n').filter(line => line.trim());
  const keyPoints = lines
    .filter(line => line.includes('趨勢') || line.includes('流行') || line.includes('推薦'))
    .slice(0, 3);
    
  return keyPoints.join('\n');
}

/**
 * 壓縮RAG知識庫結果
 */
function compressRagContext(ragData: any[]): string {
  if (!ragData || ragData.length === 0) return '';
  
  // 只保留最相關的2個結果，簡化內容
  return ragData.slice(0, 2).map(item => 
    `${item.source}: ${item.content.substring(0, 100)}...`
  ).join('\n');
}

/**
 * 主要壓縮函數
 */
export function compressEvidence(data: {
  fashionItems?: any[];
  weatherContext?: any;
  trendContext?: string;
  ragContext?: any[];
  userConstraints?: string[];
}): CompressedEvidence {
  
  const originalContent = JSON.stringify(data);
  const originalSize = originalContent.length;
  
  // 執行壓縮
  const compressed: CompressedEvidence = {
    candidates: compressCandidates(data.fashionItems || []),
    weather_context: compressWeatherContext(data.weatherContext),
    trend_context: compressTrendContext(data.trendContext || ''),
    rag_context: compressRagContext(data.ragContext || []),
    constraints: [
      ...(data.userConstraints || []),
      "不分析身型資料",
      "不編造價格資訊",
      "引用真實來源"
    ],
    metadata: {
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 0
    }
  };
  
  // 計算壓縮效果
  const compressedContent = JSON.stringify(compressed);
  const compressedSize = compressedContent.length;
  
  compressed.metadata = {
    originalSize,
    compressedSize,
    compressionRatio: originalSize > 0 ? (compressedSize / originalSize) : 1
  };
  
  return compressed;
}

/**
 * 將壓縮後的證據包轉換為字符串
 */
export function evidenceToString(evidence: CompressedEvidence): string {
  const sections = [];
  
  if (evidence.candidates.length > 0) {
    sections.push(`**商品候選:**\n${JSON.stringify(evidence.candidates, null, 2)}`);
  }
  
  if (evidence.weather_context) {
    // 直接使用完整的天氣穿搭計劃，不添加額外標題
    sections.push(evidence.weather_context);
  }
  
  if (evidence.trend_context) {
    sections.push(`**趨勢資訊:**\n${evidence.trend_context}`);
  }
  
  if (evidence.rag_context) {
    sections.push(`**知識庫:**\n${evidence.rag_context}`);
  }
  
  if (evidence.constraints.length > 0) {
    sections.push(`**限制條件:**\n${evidence.constraints.map(c => `- ${c}`).join('\n')}`);
  }
  
  return sections.join('\n\n');
}

export default { compressEvidence, evidenceToString };