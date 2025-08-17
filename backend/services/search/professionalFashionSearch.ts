// 專業時尚趨勢搜尋供應商
// 整合 RSS 抓取、NER 處理、標準化輸出

import { IWebSearch, SearchHit, SearchOptions } from "./webSearch";
import Parser from "rss-parser";
import fetch from "node-fetch";
import * as crypto from "crypto";

export interface FashionTrendDoc {
  id: string;
  title: string;
  url: string;
  source: string;
  published_at?: string;
  snippet?: string;
  region_hint?: "JP"|"KR"|"EU"|"US"|"TW";
  season_hint?: string;
  type?: "runway"|"street"|"editorial"|"news";
  priority: number;
}

// 專業時尚媒體白名單
const FASHION_SOURCES = [
  { source: "Fashionista", url: "https://fashionista.com/.rss/full/", priority: 9 },
  { source: "Highsnobiety", url: "https://www.highsnobiety.com/feed/", priority: 8 },
  { source: "Hypebeast", url: "https://hypebeast.com/feed", priority: 8 },
  { source: "GQ", url: "https://www.gq.com/feed/rss", priority: 7 },
  { source: "ELLE", url: "https://www.elle.com/rss/all.xml/", priority: 7 },
];

// 時尚 NER - 風格映射
const STYLE_KEYWORDS = {
  "quiet luxury": "極簡 (Minimalist)",
  "minimal|clean lines": "極簡 (Minimalist)", 
  "french|paris|chic": "法式優雅 (French Chic)",
  "korean|seoul|han|clean layering": "清新韓系 (Fresh Korean)",
  "street|streetwear|hype": "街頭風 (Streetwear)",
  "office|workwear|tailored": "都會通勤 (Urban Office)",
  "american|preppy|varsity": "美式休閒 (American Casual)",
  "vintage|retro|y2k": "復古懷舊 (Retro / Vintage)",
  "athleisure|sport|active": "機能運動 (Athleisure)",
  "glam|party|evening": "摩登華麗 (Glamorous)",
  "sweet|girly|coquette": "甜美少女 (Sweet / Girly)"
};

const FASHION_COLORS = [
  "silver", "metallic", "sage", "mint", "cherry red", "butter", 
  "粉", "灰藍", "軍綠", "桃紅", "酒紅", "拿鐵", "奶油白"
];

const FASHION_ITEMS = [
  "mary jane", "kitten heel", "cargo", "blouson", "tube top", 
  "polo", "loafer", "trench", "cardigan", "pleated skirt", "slip dress"
];

export class ProfessionalFashionSearch implements IWebSearch {
  private parser: Parser;
  private lastRequest = new Map<string, number>();
  private rateLimitMs = 1000; // 1 req/s per domain

  constructor() {
    this.parser = new Parser({
      timeout: 5000,
      headers: {
        'User-Agent': 'StylemateBot/1.0 (+https://stylemate.app/bot)'
      }
    });
  }

  async search(opts: SearchOptions): Promise<SearchHit[]> {
    const results: SearchHit[] = [];
    
    // 判斷查詢類型
    const isFashionWeekQuery = /時裝周|fashion week|runway|서울패션위크/i.test(opts.q);
    const query = opts.q.toLowerCase();

    for (const source of FASHION_SOURCES) {
      try {
        // 節流控制
        await this.respectRateLimit(this.getDomain(source.url));
        
        const feed = await this.parser.parseURL(source.url);
        
        for (const item of (feed.items || []).slice(0, 20)) {
          const title = (item.title || "").trim();
          if (!title) continue;
          
          // 關鍵詞過濾
          if (!this.passKeywordFilter(title, query, isFashionWeekQuery)) continue;
          
          const fashionDoc: FashionTrendDoc = {
            id: this.hash(`${source.source}:${title}`),
            title,
            url: item.link || "",
            source: source.source,
            published_at: (item as any).isoDate || item.pubDate,
            snippet: this.extractSnippet(item.contentSnippet || item.content || "", title),
            region_hint: this.guessRegion(title, source.source),
            season_hint: this.guessSeason(title),
            type: this.guessType(title),
            priority: source.priority
          };

          // 轉換為 SearchHit 格式
          results.push({
            title: fashionDoc.title,
            url: fashionDoc.url,
            snippet: fashionDoc.snippet,
            source: "professional_fashion" as any,
            published_at: fashionDoc.published_at,
            site: fashionDoc.source
          });
        }
      } catch (error) {
        console.warn(`時尚來源 ${source.source} 抓取失敗:`, error);
        // 單一來源失敗不影響整體
        continue;
      }
    }

    // 按時間和優先級排序
    return results
      .sort((a, b) => {
        const timeA = a.published_at ? new Date(a.published_at).getTime() : 0;
        const timeB = b.published_at ? new Date(b.published_at).getTime() : 0;
        return timeB - timeA; // 最新的在前
      })
      .slice(0, opts.topK || 8);
  }

  private async respectRateLimit(domain: string): Promise<void> {
    const now = Date.now();
    const lastTime = this.lastRequest.get(domain) || 0;
    const elapsed = now - lastTime;
    
    if (elapsed < this.rateLimitMs) {
      const waitTime = this.rateLimitMs - elapsed;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequest.set(domain, Date.now());
  }

  private getDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  private passKeywordFilter(title: string, query: string, isFashionWeekQuery: boolean): boolean {
    const t = title.toLowerCase();
    
    if (isFashionWeekQuery) {
      return /runway|fashion week|時裝周|服裝周|collection|spring|summer|fall|winter/i.test(t);
    }
    
    // 一般時尚趨勢過濾
    const hasGeneralFashion = /trend|流行|趨勢|style|fashion|lookbook|outfit/i.test(t);
    const hasSpecificQuery = query.split(/\s+/).some(word => 
      word.length > 2 && t.includes(word)
    );
    
    return hasGeneralFashion || hasSpecificQuery;
  }

  private extractSnippet(content: string, title: string): string {
    if (!content) return "";
    
    // 清理 HTML 和多餘空白
    const cleaned = content
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    
    // 提取時尚相關的關鍵句子
    const sentences = cleaned.split(/[.!?。！？]/);
    const relevantSentences = sentences.filter(s => {
      const lower = s.toLowerCase();
      return /trend|style|fashion|color|fabric|design|collection/i.test(lower);
    });
    
    const snippet = relevantSentences.length > 0 
      ? relevantSentences.slice(0, 2).join(". ").trim()
      : cleaned.slice(0, 200);
    
    return snippet.slice(0, 240) + (snippet.length > 240 ? "..." : "");
  }

  private guessRegion(title: string, source: string): FashionTrendDoc["region_hint"] {
    const t = `${source} ${title}`.toLowerCase();
    if (/japan|tokyo|日|jp/i.test(t)) return "JP";
    if (/korea|seoul|韓|kr/i.test(t)) return "KR";
    if (/paris|milan|london|europe|歐|eu/i.test(t)) return "EU";
    if (/new york|usa|美|us/i.test(t)) return "US";
    if (/taiwan|taipei|台|tw/i.test(t)) return "TW";
    return undefined;
  }

  private guessSeason(title: string): string | undefined {
    const t = title.toUpperCase();
    if (/\b(AW|FALL|AUTUMN|秋冬)\b/i.test(t)) return "AW";
    if (/\b(SS|SPRING|SUMMER|春夏)\b/i.test(t)) return "SS";
    return undefined;
  }

  private guessType(title: string): FashionTrendDoc["type"] {
    const t = title.toLowerCase();
    if (/runway|fashion week|front row/i.test(t)) return "runway";
    if (/street style/i.test(t)) return "street";
    if (/editorial|lookbook/i.test(t)) return "editorial";
    return "news";
  }

  private hash(s: string): string {
    return crypto.createHash("md5").update(s).digest("hex");
  }
}