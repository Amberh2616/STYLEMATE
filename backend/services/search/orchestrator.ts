// backend/services/search/orchestrator.ts

import { BingWebSearch, TavilySearch, OpenAIFashionSearch } from "./webSearch";
import { ProfessionalFashionSearch } from "./professionalFashionSearch";
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
  private main: ProfessionalFashionSearch | OpenAIFashionSearch | BingWebSearch | null = null;
  private backup: TavilySearch | null = null;

  constructor() {
    const openaiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY;
    const bingKey = process.env.BING_KEY;
    const tavilyKey = process.env.TAVILY_KEY;

    // 🎯 優先使用專業時尚搜尋（RSS + 權威來源）
    this.main = new ProfessionalFashionSearch();

    // 備援：OpenAI 或 Bing
    if (tavilyKey) {
      this.backup = new TavilySearch(tavilyKey);
    } else if (openaiKey) {
      this.backup = new OpenAIFashionSearch(openaiKey);
    } else if (bingKey) {
      this.backup = new BingWebSearch(bingKey);
    }

    console.log("🔍 WebSearch 初始化完成 - 主要：專業時尚搜尋，備援：", this.backup ? "已設定" : "無");
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
          if (this.main instanceof ProfessionalFashionSearch) {
            searchProvider = "professional_fashion";
          } else if (this.main instanceof OpenAIFashionSearch) {
            searchProvider = "openai";
          } else {
            searchProvider = "bing";
          }
        } catch (error) {
          console.warn("Primary search failed, trying backup:", error);
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

      // 第2步：處理搜尋結果
      let evidences: Evidence[];
      let crawledPages = 0;
      let successfulExtractions = 0;

      if (searchProvider === "openai" || searchProvider === "professional_fashion") {
        // 專業時尚搜尋/OpenAI 直接返回結構化內容，不需要爬取
        const sourceName = searchProvider === "professional_fashion" ? "專業時尚媒體" : "OpenAI";
        console.log(`🎯 Processing ${hits.length} ${sourceName} trends...`);
        
        evidences = hits.map((hit, i) => ({
          id: i + 1,
          title: hit.title,
          url: hit.url,
          text: hit.snippet || "",
          site: hit.site,
          published_at: hit.published_at,
          quotes: hit.snippet ? [hit.snippet.substring(0, 200) + "..."] : [],
          score: 0.9 // OpenAI 生成的內容給予高分
        }));
        
        crawledPages = hits.length;
        successfulExtractions = hits.length;
      } else {
        // Bing/Tavily 需要爬取頁面
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

        // 第4步：建立 Evidence
        evidences = cleanResults.map((clean, i) => buildEvidence(clean, i + 1));
        crawledPages = successfulPages.length;
        successfulExtractions = cleanResults.length;
      }
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
          crawled_pages: crawledPages,
          successful_extractions: successfulExtractions,
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