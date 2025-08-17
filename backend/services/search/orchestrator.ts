// backend/services/search/orchestrator.ts

import { BingWebSearch, TavilySearch } from "./webSearch";
import { fetchHtml, cleanWithReadability } from "./crawl";
import { buildEvidence, Evidence, extractFashionKeywords } from "./extractors";
import { rerank, FASHION_AUTHORITY_SITES } from "./ranker";

export interface SearchResult {
  query: string;
  evidences: Evidence[];
  sources: {
    id: number;
    title: string;
    url: string;
    site?: string;
    published_at?: string;
    score?: number;
  }[];
  metadata: {
    total_hits: number;
    crawled_pages: number;
    successful_extractions: number;
    processing_time_ms: number;
    search_provider: string;
    fashion_keywords: string[];
  };
}

export class WebSearchOrchestrator {
  private main: BingWebSearch | null = null;
  private backup: TavilySearch | null = null;

  constructor() {
    const bingKey = process.env.BING_KEY;
    const tavilyKey = process.env.TAVILY_KEY;

    if (bingKey) {
      this.main = new BingWebSearch(bingKey);
    }

    if (tavilyKey) {
      this.backup = new TavilySearch(tavilyKey);
    }

    if (!this.main && !this.backup) {
      throw new Error("至少需要設定 BING_KEY 或 TAVILY_KEY");
    }
  }

  async run(q: string): Promise<SearchResult> {
    const startTime = Date.now();
    let searchProvider = "unknown";
    
    try {
      // 第1步：搜尋
      let hits;
      
      if (this.main) {
        try {
          hits = await this.main.search({ 
            q, 
            topK: 8, 
            market: "zh-TW", 
            lang: "zh-TW" 
          });
          searchProvider = "bing";
        } catch (error) {
          console.warn("Bing search failed, trying backup:", error);
          if (!this.backup) throw error;
          
          hits = await this.backup.search({ q, topK: 8 });
          searchProvider = "tavily";
        }
      } else if (this.backup) {
        hits = await this.backup.search({ q, topK: 8 });
        searchProvider = "tavily";
      } else {
        throw new Error("SEARCH_UNAVAILABLE");
      }

      // 第2步：並行抓取頁面
      console.log(`🔍 Found ${hits.length} search results, starting crawl...`);
      
      const crawlPromises = hits.map(hit => 
        fetchHtml(hit.url).catch(error => ({
          url: hit.url,
          status: 0,
          error: error.message
        }))
      );

      const pages = await Promise.allSettled(crawlPromises);
      const successfulPages = pages
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === "fulfilled" && result.value.status === 200
        )
        .map(result => result.value);

      console.log(`📄 Successfully crawled ${successfulPages.length}/${hits.length} pages`);

      // 第3步：內容清洗和提取
      const cleanResults = successfulPages
        .map(page => cleanWithReadability(page))
        .filter(Boolean) as any[];

      console.log(`✨ Successfully extracted ${cleanResults.length} clean documents`);

      // 第4步：建立 Evidence 並提取時尚關鍵詞
      const evidences = cleanResults.map((clean, i) => buildEvidence(clean, i + 1));
      const allText = evidences.map(e => e.text).join(" ");
      const fashionKeywords = extractFashionKeywords(allText);

      // 第5步：智能排序與去重
      const rankedEvidences = rerank(evidences, {
        query: q,
        recencyBoostDays: 180,
        authoritySites: FASHION_AUTHORITY_SITES,
        fashionKeywords
      });

      // 第6步：生成結果
      const processingTime = Date.now() - startTime;
      
      const result: SearchResult = {
        query: q,
        evidences: rankedEvidences,
        sources: rankedEvidences.map(e => ({
          id: e.id,
          title: e.title,
          url: e.url,
          site: e.site,
          published_at: e.published_at,
          score: e.score
        })),
        metadata: {
          total_hits: hits.length,
          crawled_pages: successfulPages.length,
          successful_extractions: cleanResults.length,
          processing_time_ms: processingTime,
          search_provider: searchProvider,
          fashion_keywords: fashionKeywords
        }
      };

      console.log(`🎯 WebSearch completed in ${processingTime}ms`);
      return result;

    } catch (error: any) {
      console.error("WebSearch orchestrator failed:", error);
      
      // 返回空結果而非拋出錯誤，讓上層能夠處理
      return {
        query: q,
        evidences: [],
        sources: [],
        metadata: {
          total_hits: 0,
          crawled_pages: 0,
          successful_extractions: 0,
          processing_time_ms: Date.now() - startTime,
          search_provider: "failed",
          fashion_keywords: []
        }
      };
    }
  }

  /**
   * 健康檢查：測試搜尋服務是否可用
   */
  async healthCheck(): Promise<{ status: string; providers: string[] }> {
    const providers: string[] = [];
    
    if (this.main) {
      try {
        await this.main.search({ q: "test", topK: 1 });
        providers.push("bing");
      } catch (error) {
        console.warn("Bing health check failed:", error);
      }
    }

    if (this.backup) {
      try {
        await this.backup.search({ q: "test", topK: 1 });
        providers.push("tavily");
      } catch (error) {
        console.warn("Tavily health check failed:", error);
      }
    }

    return {
      status: providers.length > 0 ? "healthy" : "unhealthy",
      providers
    };
  }
}

export default WebSearchOrchestrator;