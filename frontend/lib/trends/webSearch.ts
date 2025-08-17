// Web Search Aggregator for fashion trends
// 優先使用 RSS，其次清單頁；僅保存 標題/摘要/時間/來源/連結（不存全文）
import Parser from "rss-parser";
const fetch = require("node-fetch");
import * as crypto from "crypto";
const cheerio = require("cheerio");

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

// —— 可擴充的 RSS 白名單來源 —— //
const RSS_SOURCES: { source: string; url: string; region?: TrendDoc["region_hint"] }[] = [
  { source: "Highsnobiety", url: "https://www.highsnobiety.com/feed/" },
  { source: "Fashionista",  url: "https://fashionista.com/.rss/full/" },
  // 備註：Hypebeast RSS 暫時失效，先移除
  // { source: "Hypebeast",    url: "https://hypebeast.com/rss" },
];

// —— 可選：清單頁（僅少量、穩定結構的站點） —— //
const LIST_PAGES: { source: string; url: string; region?: TrendDoc["region_hint"]; selector: string }[] = [
  // 範例（請確認目標站結構後再啟用）
  // { source: "CFDA/NYFW", url: "https://cfda.com/news", selector: ".news-item", region: "US" },
];

export async function fetchTrendDocs(
  opts: { regions?: string[]; season?: string; fashionWeek?: boolean } = {}
): Promise<TrendDoc[]> {
  const out: TrendDoc[] = [];

  // 1) RSS：低風險、穩定
  const parser = new Parser();
  for (const src of RSS_SOURCES) {
    try {
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
      const r = await fetch(lp.url, { headers: { "User-Agent": "StylemateBot/1.0" } });
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
function hash(s: string) { return crypto.createHash("md5").update(s).digest("hex"); }
function dedupe(arr: TrendDoc[]) {
  const m = new Map<string, TrendDoc>();
  for (const x of arr) if (!m.has(x.id)) m.set(x.id, x);
  return [...m.values()];
}