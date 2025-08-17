// backend/services/search/extractors.ts
// Evidence 正規化（限制長度、短引用）

export interface Evidence {
  id: number;
  title: string;
  url: string;
  site?: string;
  published_at?: string;  // ISO
  text: string;           // ≤ maxChars
  quotes?: string[];      // 每段 ≤ 25 字
  byline?: string;        // 作者
  excerpt?: string;       // 摘要
  score?: number;         // 相關性評分
}

export function buildEvidence(
  clean: { 
    url: string; 
    title: string; 
    site?: string; 
    published_at?: string; 
    text: string;
    byline?: string;
    excerpt?: string;
  }, 
  id: number, 
  maxChars = 8000
): Evidence {
  const safeText = (clean.text || "").slice(0, maxChars);
  
  return {
    id,
    title: clean.title || clean.site || clean.url,
    url: clean.url,
    site: clean.site,
    published_at: clean.published_at,
    text: safeText,
    quotes: pickShortQuotes(safeText, 3),
    byline: clean.byline,
    excerpt: clean.excerpt
  };
}

function pickShortQuotes(text: string, k = 3): string[] {
  // 優先選擇完整的句子
  const sentences = text.split(/[。！？.!?]+/).map(s => s.trim()).filter(Boolean);
  
  // 篩選合適長度的句子（8-50字）
  const candidates = sentences
    .filter(s => s.length >= 8 && s.length <= 50)
    .slice(0, 20); // 先取前20個候選

  // 如果沒有合適的句子，則按行切分
  if (candidates.length === 0) {
    const lines = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const lineCandidates = lines
      .filter(s => s.length >= 8 && s.length <= 60)
      .slice(0, 10);
    
    return lineCandidates.map(s => truncateToWords(s, 25)).slice(0, k);
  }

  // 選擇最具代表性的句子（按長度和位置權重）
  const weighted = candidates.map((sent, idx) => ({
    text: sent,
    score: Math.min(sent.length / 30, 1) * (1 - idx / candidates.length * 0.3)
  }));

  return weighted
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(item => truncateToWords(item.text, 25));
}

function truncateToWords(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  
  // 在字詞邊界截斷，避免切斷中文字或英文單詞
  const truncated = text.slice(0, maxChars);
  const lastSpace = Math.max(
    truncated.lastIndexOf(' '),
    truncated.lastIndexOf('，'),
    truncated.lastIndexOf('、')
  );
  
  if (lastSpace > maxChars * 0.7) {
    return truncated.slice(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * 從文本中提取關鍵時尚術語
 */
export function extractFashionKeywords(text: string): string[] {
  const fashionTerms = [
    // 顏色類
    '薄荷綠', '珊瑚粉', '檸檬黃', '駝色', '橄欖綠', '酒紅', '深海藍', '櫻花粉',
    // 風格類  
    '極簡', '復古', '街頭', '甜美', '俐落', '浪漫', '中性', '前衛',
    // 材質類
    '絲綢', '棉麻', '羊毛', '針織', '雪紡', '牛仔', '皮革', '絨面',
    // 版型類
    'oversized', 'cropped', 'A字', '高腰', '寬鬆', '修身', '直筒', '喇叭',
    // 單品類
    '襯衫', '針織衫', '外套', '洋裝', '短裙', '長褲', '靴子', '包款'
  ];

  const found = fashionTerms.filter(term => 
    text.toLowerCase().includes(term.toLowerCase())
  );

  return [...new Set(found)]; // 去重
}