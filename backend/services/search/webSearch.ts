// backend/services/search/webSearch.ts
// 供應商統一介面：Bing（主）+ Tavily（備）

export type SearchSource = "bing" | "tavily";

export interface SearchHit {
  title: string;
  url: string;
  snippet?: string;
  source: SearchSource;
  published_at?: string;   // ISO
  site?: string;           // e.g., "vogue.com"
}

export interface SearchOptions {
  q: string;
  topK?: number;
  lang?: string;    // "zh-TW", "en-US"
  market?: string;  // "zh-TW", "en-US"
}

export interface IWebSearch {
  search(opts: SearchOptions): Promise<SearchHit[]>;
}

export class BingWebSearch implements IWebSearch {
  constructor(
    private apiKey: string, 
    private endpoint = "https://api.bing.microsoft.com/v7.0/search"
  ) {
    if (!apiKey) {
      throw new Error("BING_KEY is required");
    }
  }

  async search(opts: SearchOptions): Promise<SearchHit[]> {
    const params = new URLSearchParams({
      q: opts.q,
      mkt: opts.market || "zh-TW",
      setLang: opts.lang || "zh-TW",
      count: String(opts.topK ?? 8),
      textDecorations: "false",
      safeSearch: "Moderate"
    });

    const res = await fetch(`${this.endpoint}?${params.toString()}`, {
      headers: { 
        "Ocp-Apim-Subscription-Key": this.apiKey,
        "User-Agent": "StylemateBot/1.0"
      }
    });

    if (!res.ok) {
      throw new Error(`BING_${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const webPages = data.webPages?.value ?? [];
    
    return webPages.slice(0, opts.topK ?? 8).map((x: any) => ({
      title: x.name,
      url: x.url,
      snippet: x.snippet,
      source: "bing" as const,
      published_at: x.dateLastCrawled ? new Date(x.dateLastCrawled).toISOString() : undefined,
      site: tryGetSite(x.url)
    }));
  }
}

export class TavilySearch implements IWebSearch {
  constructor(
    private apiKey: string, 
    private endpoint = "https://api.tavily.com/search"
  ) {
    if (!apiKey) {
      throw new Error("TAVILY_KEY is required");
    }
  }

  async search(opts: SearchOptions): Promise<SearchHit[]> {
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${this.apiKey}` 
      },
      body: JSON.stringify({
        query: opts.q,
        max_results: opts.topK ?? 8,
        search_depth: "basic",
        include_answers: false,
        include_images: false
      })
    });

    if (!res.ok) {
      throw new Error(`TAVILY_${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    return (data.results || []).map((r: any) => ({
      title: r.title,
      url: r.url,
      snippet: r.content,
      source: "tavily" as const,
      published_at: r.published_date || undefined,
      site: tryGetSite(r.url)
    }));
  }
}

function tryGetSite(url: string): string | undefined {
  try { 
    return new URL(url).hostname.replace(/^www\./, ""); 
  } catch { 
    return undefined; 
  }
}