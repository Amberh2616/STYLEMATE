// Web Search Aggregator for fashion trends
// 優先使用 RSS，其次清單頁；僅保存 標題/摘要/時間/來源/連結（不存全文）
import Parser from "rss-parser";
import fetch from "node-fetch";
import * as crypto from "crypto";
import * as cheerio from "cheerio";

// 禮節配置：遵守 robots.txt，設定節流
const CRAWL_CONFIG = {
  userAgent: "StylemateBot/1.0 (+https://stylemate.app/bot)",
  rateLimitMs: 1000, // 每站 1 req/s
  timeout: 5000,
  maxRedirects: 3,
  respectRobots: true
};

// 節流管理
const lastRequest = new Map<string, number>();

export type TrendDoc = {
  id: string;
  title: string;
  url: string;
  source: string;            // 來源站名或域名
  published_at?: string;     // ISO string
  snippet?: string;          // 短摘要（最多 240 字）
  region_hint?: "JP"|"KR"|"EU"|"US"|"TW";
  season_hint?: string;      // "2025AW" | "2026SS" | undefined
  type?: "runway"|"street"|"editorial"|"news";
  image?: string;            // 可選：封面圖
};

// —— 權威時尚媒體白名單來源 —— //
const RSS_SOURCES: { source: string; url: string; region?: TrendDoc["region_hint"]; priority: number }[] = [
  // 權威時尚媒體
  { source: "Fashionista", url: "https://fashionista.com/.rss/full/", priority: 9 },
  { source: "Highsnobiety", url: "https://www.highsnobiety.com/feed/", priority: 8 },
  { source: "Hypebeast", url: "https://hypebeast.com/feed", priority: 8 },
  { source: "GQ", url: "https://www.gq.com/feed/rss", priority: 7 },
  { source: "ELLE", url: "https://www.elle.com/rss/all.xml/", priority: 7 },
  { source: "Harper's BAZAAR", url: "https://www.harpersbazaar.com/rss/all.xml/", priority: 7 },
  { source: "Dazed", url: "https://www.dazeddigital.com/rss", priority: 6 },
  { source: "i-D", url: "https://i-d.vice.com/rss", priority: 6 },
];

// —— 官方/主辦方清單頁 —— //
const LIST_PAGES: { source: string; url: string; region?: TrendDoc["region_hint"]; selector: string; priority: number }[] = [
  // 時裝周官方組織
  { source: "CFDA (NYFW)", url: "https://cfda.com/news", selector: ".news-item", region: "US", priority: 10 },
  { source: "BFC (LFW)", url: "https://www.britishfashioncouncil.co.uk/news", selector: ".news-card", region: "EU", priority: 10 },
  { source: "CNMI (MFW)", url: "https://www.cameramoda.it/en/news/", selector: ".news-list-item", region: "EU", priority: 10 },
  { source: "FHCM (PFW)", url: "https://fhcm.paris/en/news/", selector: ".actualite-item", region: "EU", priority: 10 },
];

export async function fetchTrendDocs(
  opts: { regions?: string[]; season?: string; fashionWeek?: boolean } = {}
): Promise<TrendDoc[]> {
  const out: TrendDoc[] = [];

  // 1) RSS：低風險、穩定
  const parser = new Parser({
    timeout: CRAWL_CONFIG.timeout,
    headers: {
      'User-Agent': CRAWL_CONFIG.userAgent
    }
  });
  
  for (const src of RSS_SOURCES) {
    try {
      // 節流控制
      await respectRateLimit(getDomain(src.url));
      
      const feed = await parser.parseURL(src.url);
      for (const item of (feed.items || []).slice(0, 50)) {
        const title = (item.title || "").trim();
        if (!title) continue;
        if (!passKeyword(title, opts)) continue;
        const url = (item.link || "").trim();
        const snippet = ((item.contentSnippet || item.content || "").replace(/\s+/g, " ").trim()).slice(0, 240);
        const id = hash(`${src.source}:${title}`);
        out.push({
          id,
          title,
          url,
          source: src.source,
          published_at: (item as any).isoDate || item.pubDate || undefined,
          snippet,
          type: guessType(title),
          region_hint: src.region || guessRegion(title, src.source),
          season_hint: guessSeason(title),
        });
      }
    } catch {
      /* 單一來源失敗不影響整體 */
    }
  }

  // 2) 清單頁：只抓標題/連結/時間（若可得）
  for (const lp of LIST_PAGES) {
    try {
      // 節流控制
      await respectRateLimit(getDomain(lp.url));
      
      const r = await fetch(lp.url, { 
        headers: { "User-Agent": CRAWL_CONFIG.userAgent },
        timeout: CRAWL_CONFIG.timeout
      });
      if (!r.ok) continue;
      const html = await r.text();
      const $ = cheerio.load(html);
      $(lp.selector).each((_, el) => {
        const title = $(el).find("a").first().text().trim();
        const href = $(el).find("a").first().attr("href") || "";
        if (!title || !href) return;
        if (!passKeyword(title, opts)) return;
        const url = href.startsWith("http") ? href : new URL(href, lp.url).href;
        const id = hash(`${lp.source}:${title}`);
        out.push({ id, title, url, source: lp.source, region_hint: lp.region || guessRegion(title, lp.source), type: guessType(title) });
      });
    } catch {}
  }

  return dedupe(out);
}

// —— 規則輔助 —— //
function passKeyword(title: string, o: any) {
  const t = title.toLowerCase();
  const hitTrend = /(trend|流行|趨勢|runway|fashion week|lookbook|collection|aw|ss)/i.test(t);
  if (o?.fashionWeek) return /(runway|fashion week|時裝周|服裝周)/i.test(t);
  return hitTrend;
}
function guessType(title: string): TrendDoc["type"] {
  const t = title.toLowerCase();
  if (/runway|fashion week|front row/.test(t)) return "runway";
  if (/street style/.test(t)) return "street";
  if (/editorial|lookbook/.test(t)) return "editorial";
  return "news";
}
function guessRegion(title: string, source: string): TrendDoc["region_hint"] {
  const t = `${source} ${title}`.toLowerCase();
  if (/japan|tokyo|日/.test(t)) return "JP";
  if (/korea|seoul|韓/.test(t)) return "KR";
  if (/paris|milan|london|europe|歐/.test(t)) return "EU";
  if (/new york|usa|美/.test(t)) return "US";
  return undefined;
}
function guessSeason(title: string): string | undefined {
  const t = title.toUpperCase();
  if (/\bAW ?(20\d{2}|25|26)\b/.test(t) || /FALL|AUTUMN|秋冬/.test(t)) return "AW";
  if (/\bSS ?(20\d{2}|25|26)\b/.test(t) || /SPRING|SUMMER|春夏/.test(t)) return "SS";
  return undefined;
}
// —— 節流與禮節工具函數 —— //
async function respectRateLimit(domain: string): Promise<void> {
  const now = Date.now();
  const lastTime = lastRequest.get(domain) || 0;
  const elapsed = now - lastTime;
  
  if (elapsed < CRAWL_CONFIG.rateLimitMs) {
    const waitTime = CRAWL_CONFIG.rateLimitMs - elapsed;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequest.set(domain, Date.now());
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function hash(s: string) { return crypto.createHash("md5").update(s).digest("hex"); }

function dedupe(arr: TrendDoc[]) {
  const m = new Map<string, TrendDoc>();
  for (const x of arr) if (!m.has(x.id)) m.set(x.id, x);
  return [...m.values()].sort((a, b) => {
    // 按優先級和時間排序
    const timeA = a.published_at ? new Date(a.published_at).getTime() : 0;
    const timeB = b.published_at ? new Date(b.published_at).getTime() : 0;
    return timeB - timeA; // 最新的在前
  });
}