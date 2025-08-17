// backend/services/search/crawl.ts
// 抓取 + Readability 清洗（JSDOM）

import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export interface RawPage { 
  url: string; 
  status: number; 
  html?: string;
  error?: string;
}

export interface CleanDoc {
  url: string;
  title: string;
  site?: string;
  published_at?: string; // ISO
  text: string;          // 清洗後正文
  byline?: string;       // 作者
  excerpt?: string;      // 摘要
}

export async function fetchHtml(url: string, timeoutMs = 12000): Promise<RawPage> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  
  try {
    const res = await fetch(url, { 
      signal: ctrl.signal, 
      headers: { 
        "User-Agent": "StylemateBot/1.0 (Fashion Trend Analysis)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate",
        "Cache-Control": "no-cache"
      } 
    });

    if (!res.ok) {
      return { url, status: res.status, error: `HTTP ${res.status}` };
    }

    const html = await res.text();
    return { url, status: res.status, html };
  } catch (error: any) {
    return { 
      url, 
      status: 0, 
      error: error.name === 'AbortError' ? 'TIMEOUT' : error.message 
    };
  } finally {
    clearTimeout(t);
  }
}

export function cleanWithReadability(raw: RawPage): CleanDoc | null {
  if (!raw.html || raw.status !== 200) return null;
  
  try {
    const dom = new JSDOM(raw.html, { url: raw.url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    if (!article || !article.textContent) return null;

    // 清理文本：移除多餘空白、修正編碼問題
    const cleanText = article.textContent
      .replace(/\s+\n/g, "\n")
      .replace(/\n+/g, "\n")
      .replace(/\s{3,}/g, " ")
      .trim();

    if (cleanText.length < 100) return null; // 過短的內容可能是錯誤頁面

    return {
      url: raw.url,
      title: (article.title || "").trim(),
      site: tryGetSite(raw.url),
      published_at: guessPublishedAt(dom.window.document),
      text: cleanText,
      byline: (article.byline || "").trim(),
      excerpt: (article.excerpt || "").trim()
    };
  } catch (error) {
    console.warn(`Readability failed for ${raw.url}:`, error);
    return null;
  }
}

function guessPublishedAt(doc: Document): string | undefined {
  // 嘗試多種日期格式
  const selectors = [
    'meta[property="article:published_time"]',
    'meta[name="date"]',
    'meta[name="publishdate"]',
    'meta[name="publish_date"]',
    'time[datetime]',
    '.published-date',
    '.publish-date',
    '.date'
  ];

  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    if (!el) continue;

    const dateStr = el.getAttribute("content") || 
                   el.getAttribute("datetime") || 
                   el.textContent?.trim();
    
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(+d)) {
        return d.toISOString();
      }
    }
  }

  return undefined;
}

function tryGetSite(url: string): string | undefined {
  try { 
    return new URL(url).hostname.replace(/^www\./, ""); 
  } catch { 
    return undefined; 
  }
}