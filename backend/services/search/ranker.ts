// backend/services/search/ranker.ts

import type { Evidence } from "./extractors";

export interface RankOptions {
  query: string;
  recencyBoostDays?: number;       // 新鮮度加分窗口
  authoritySites?: string[];       // 權威站域名白名單
  fashionKeywords?: string[];      // 時尚關鍵詞權重
}

export function rerank(evs: Evidence[], opts: RankOptions): Evidence[] {
  const now = Date.now();
  const scored = evs.map(e => {
    // 1. 語義相似度 (0~1)
    const similarity = jaccard(
      (e.title + " " + e.text.slice(0, 240)).toLowerCase(), 
      (opts.query || "").toLowerCase()
    );
    
    // 2. 新鮮度加分 (0~0.2)  
    const recency = recencyScore(e.published_at, now, opts.recencyBoostDays ?? 180);
    
    // 3. 權威站點加分 (0~0.15)
    const authority = opts.authoritySites?.includes(e.site || "") ? 0.15 : 0;
    
    // 4. 時尚關鍵詞匹配加分 (0~0.1)
    const fashionBoost = fashionKeywordScore(e.text, opts.fashionKeywords || []);
    
    // 5. 內容質量評分 (0~0.1)
    const quality = contentQualityScore(e);

    const totalScore = similarity + recency + authority + fashionBoost + quality;
    
    return { 
      ...e, 
      score: totalScore,
      scoreBreakdown: {
        similarity: Math.round(similarity * 100) / 100,
        recency: Math.round(recency * 100) / 100,
        authority: Math.round(authority * 100) / 100,
        fashion: Math.round(fashionBoost * 100) / 100,
        quality: Math.round(quality * 100) / 100
      }
    };
  });

  // 排序並去重
  const sorted = scored.sort((a, b) => b.score - a.score);
  const deduped = dedupByTitleAndSite(sorted);
  
  return deduped.slice(0, 8);
}

function recencyScore(iso?: string, now = Date.now(), days = 180): number {
  if (!iso) return 0;
  
  try {
    const dt = new Date(iso).getTime();
    if (isNaN(dt)) return 0;
    
    const diffDays = (now - dt) / (86400 * 1000);
    if (diffDays <= 0) return 0.2;
    if (diffDays > days) return 0;
    
    return 0.2 * (1 - diffDays / days);
  } catch {
    return 0;
  }
}

function fashionKeywordScore(text: string, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  
  const lowerText = text.toLowerCase();
  const matches = keywords.filter(kw => lowerText.includes(kw.toLowerCase()));
  
  return Math.min(matches.length / keywords.length * 0.1, 0.1);
}

function contentQualityScore(evidence: Evidence): number {
  let score = 0;
  
  // 內容長度評分（適中長度更好）
  const textLength = evidence.text.length;
  if (textLength > 500 && textLength < 5000) {
    score += 0.03;
  }
  
  // 有作者信息加分
  if (evidence.byline && evidence.byline.length > 2) {
    score += 0.02;
  }
  
  // 有摘要加分  
  if (evidence.excerpt && evidence.excerpt.length > 10) {
    score += 0.02;
  }
  
  // 標題品質（不要全大寫，有合理長度）
  const title = evidence.title;
  if (title.length > 10 && title.length < 100 && title !== title.toUpperCase()) {
    score += 0.03;
  }
  
  return Math.min(score, 0.1);
}

function dedupByTitleAndSite(list: Evidence[]): Evidence[] {
  const seen = new Set<string>();
  const out: Evidence[] = [];
  
  for (const e of list) {
    // 標題+站點的組合作為去重key
    const normalizedTitle = e.title.toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[^\w\s\u4e00-\u9fff]/g, "")
      .slice(0, 80);
    
    const key = `${e.site || "unknown"}|${normalizedTitle}`;
    
    if (!seen.has(key)) { 
      seen.add(key); 
      out.push(e); 
    }
  }
  
  return out;
}

function jaccard(a: string, b: string): number {
  // 中英文友好的分詞
  const tokenizeA = tokenizeMixed(a);
  const tokenizeB = tokenizeMixed(b);
  
  const setA = new Set(tokenizeA);
  const setB = new Set(tokenizeB);
  
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union = setA.size + setB.size - intersection;
  
  return union === 0 ? 0 : intersection / union;
}

function tokenizeMixed(text: string): string[] {
  const tokens: string[] = [];
  
  // 英文單詞
  const words = text.match(/\b[a-zA-Z]+\b/g) || [];
  tokens.push(...words.map(w => w.toLowerCase()));
  
  // 中文字符（雙字組合）
  const chinese = text.match(/[\u4e00-\u9fff]/g) || [];
  for (let i = 0; i < chinese.length - 1; i++) {
    tokens.push(chinese[i] + chinese[i + 1]);
  }
  
  // 數字
  const numbers = text.match(/\d+/g) || [];
  tokens.push(...numbers);
  
  return tokens.filter(Boolean);
}

/**
 * 時尚領域的權威站點列表
 */
export const FASHION_AUTHORITY_SITES = [
  "vogue.com",
  "businessoffashion.com", 
  "gq.com",
  "harpersbazaar.com",
  "cosmopolitan.com",
  "elle.com",
  "refinery29.com",
  "byrdie.com",
  "wwd.com",
  "fashionista.com",
  "hypebeast.com",
  "highsnobiety.com"
];

export default { rerank, FASHION_AUTHORITY_SITES };