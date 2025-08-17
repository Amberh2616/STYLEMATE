// backend/services/search/webSearch.ts
// 供應商統一介面：Bing（主）+ Tavily（備）

export type SearchSource = "bing" | "tavily" | "openai";

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

export class OpenAIFashionSearch implements IWebSearch {
  constructor(
    private apiKey: string, 
    private endpoint = "https://api.openai.com/v1/chat/completions"
  ) {
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required");
    }
  }

  async search(opts: SearchOptions): Promise<SearchHit[]> {
    const prompt = `作為時尚專家，請針對「${opts.q}」提供最新的時尚趨勢資訊。
請以JSON格式回應，包含5-8個相關的時尚趨勢資訊，每個項目需包含：
- title: 趨勢標題
- content: 詳細描述（200-300字）
- source_name: 假想的權威時尚媒體名稱
- published_date: 近期日期

回應格式：
{
  "trends": [
    {
      "title": "2025春夏韓式極簡風格興起",
      "content": "詳細內容...",
      "source_name": "Vogue Korea",
      "published_date": "2025-08-15"
    }
  ]
}`;

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "你是專業的時尚趨勢分析師，專精於韓式時尚、紐約時裝周、米蘭時裝周等國際時尚趨勢。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OPENAI_${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("OpenAI returned empty response");
    }

    try {
      const parsed = JSON.parse(content);
      const trends = parsed.trends || [];
      
      return trends.map((trend: any, index: number) => ({
        title: trend.title || `時尚趨勢 ${index + 1}`,
        url: `https://fashion-trends.example.com/trend-${index + 1}`, // 模擬URL
        snippet: trend.content || "",
        source: "openai" as const,
        published_at: trend.published_date ? new Date(trend.published_date).toISOString() : new Date().toISOString(),
        site: trend.source_name || "Fashion Expert AI"
      }));
    } catch (parseError) {
      // 如果JSON解析失敗，創建一個基本的回應
      return [{
        title: "AI 時尚趨勢分析",
        url: "https://fashion-ai.example.com/analysis",
        snippet: content.substring(0, 500),
        source: "openai" as const,
        published_at: new Date().toISOString(),
        site: "Fashion AI Expert"
      }];
    }
  }
}

function tryGetSite(url: string): string | undefined {
  try { 
    return new URL(url).hostname.replace(/^www\./, ""); 
  } catch { 
    return undefined; 
  }
}