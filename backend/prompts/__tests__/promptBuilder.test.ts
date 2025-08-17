// backend/prompts/__tests__/promptBuilder.test.ts

import { buildSimpleMessage, buildMessages, debugMessages } from '../builder/promptBuilder';
import { routeByIntent, TEST_CASES } from '../router/decision';

describe('STYLEMATE Prompt Builder', () => {
  
  describe('路由決策測試', () => {
    TEST_CASES.forEach(testCase => {
      it(`應該正確處理: ${testCase.name}`, () => {
        const result = routeByIntent(testCase.intent);
        
        expect(result.mode).toBe(testCase.expected.mode);
        expect(result.useWeather).toBe(testCase.expected.useWeather);
        
        // 驗證沒有驗證錯誤
        const messages = buildSimpleMessage(
          result.mode, 
          testCase.intent.text_query || ""
        );
        expect(messages.validation_errors).toHaveLength(0);
      });
    });
  });

  describe('Mode Cards 注入測試', () => {
    
    it('analyze_and_recommend 模式應該注入正確的卡片', () => {
      const result = buildSimpleMessage("analyze_and_recommend", "適合約會的洋裝");
      
      expect(result.cards_used).toContain("SAFETY_COMPLIANCE@1.0");
      expect(result.cards_used).toContain("MODE_ANALYZE_V11@1.1");
      expect(result.routing.mode).toBe("analyze_and_recommend");
    });

    it('trend_summary 模式應該注入搜尋相關卡片', () => {
      const result = buildSimpleMessage("trend_summary", "今年韓國流行趨勢");
      
      expect(result.cards_used).toContain("MODE_TREND@1.0");
      expect(result.cards_used).toContain("WEBSEARCH_SUMMARIZE@2.0");
      expect(result.cards_used).toContain("TREND_EXTRACTION@1.1");
      expect(result.routing.useWebSearch).toBe(true);
      expect(result.routing.useWeather).toBe(false);
    });

    it('travel_plan 模式應該自動啟用天氣', () => {
      const result = buildSimpleMessage("travel_plan", "東京5天旅遊", {
        destinations: ["Tokyo, JP"],
        date_range: { start: "2025-09-20", end: "2025-09-25" }
      });
      
      expect(result.cards_used).toContain("MODE_TRAVEL@1.0");
      expect(result.routing.useWeather).toBe(true);
      expect(result.routing.useWebSearch).toBe(false);
    });

    it('rerank 模式應該只使用基本卡片', () => {
      const result = buildSimpleMessage("rerank", "重排這幾件");
      
      expect(result.cards_used).toContain("MODE_RERANK@1.0");
      expect(result.routing.useWeather).toBe(false);
      expect(result.routing.useWebSearch).toBe(false);
    });
  });

  describe('功能性卡片條件注入測試', () => {
    
    it('有天氣需求時應該注入天氣卡', () => {
      const result = buildSimpleMessage("analyze_and_recommend", "今天穿什麼", {
        weather: true,
        destinations: ["Taipei, TW"],
        date_range: { start: "2025-09-20", end: "2025-09-20" }
      });
      
      expect(result.cards_used).toContain("WEATHER_RULES@2.0");
    });

    it('有 RAG 需求時應該注入 RAG 卡', () => {
      const result = buildSimpleMessage("analyze_and_recommend", "婚禮穿搭建議", {
        rag: true
      });
      
      expect(result.cards_used).toContain("EXPERT_RAG@1.0");
    });

    it('沒有相應條件時不應該注入功能卡', () => {
      const result = buildSimpleMessage("analyze_and_recommend", "日常穿搭");
      
      expect(result.cards_used).not.toContain("WEATHER_RULES@2.0");
      expect(result.cards_used).not.toContain("EXPERT_RAG@1.0");
      expect(result.cards_used).not.toContain("WEBSEARCH_SUMMARIZE@2.0");
    });
  });

  describe('互斥規則驗證測試', () => {
    
    it('trend_summary 不應該查天氣', () => {
      const result = buildSimpleMessage("trend_summary", "今年流行色彩");
      
      expect(result.routing.useWeather).toBe(false);
      expect(result.validation_errors).toHaveLength(0);
    });

    it('travel_plan 必須查天氣', () => {
      const result = buildSimpleMessage("travel_plan", "出差行程");
      
      expect(result.routing.useWeather).toBe(true);
      expect(result.validation_errors).toHaveLength(0);
    });

    it('rerank 不應該使用天氣或搜尋', () => {
      const result = buildSimpleMessage("rerank", "重新排序");
      
      expect(result.routing.useWeather).toBe(false);
      expect(result.routing.useWebSearch).toBe(false);
      expect(result.validation_errors).toHaveLength(0);
    });
  });

  describe('Message 結構測試', () => {
    
    it('應該生成正確的三層 message 結構', () => {
      const result = buildSimpleMessage("analyze_and_recommend", "穿搭建議");
      
      expect(result.messages).toHaveLength(3);
      expect(result.messages[0].role).toBe("system");
      expect(result.messages[1].role).toBe("developer");
      expect(result.messages[2].role).toBe("user");
    });

    it('system message 應該包含 Master System Prompt', () => {
      const result = buildSimpleMessage("analyze_and_recommend", "穿搭建議");
      
      expect(result.messages[0].content).toContain("MASTER SYSTEM PROMPT");
      expect(result.messages[0].content).toContain("STYLEMATE AI");
    });

    it('developer message 應該包含選中的卡片', () => {
      const result = buildSimpleMessage("trend_summary", "流行趨勢");
      
      expect(result.messages[1].content).toContain("<<CARD:MODE_TREND@1.0>>");
      expect(result.messages[1].content).toContain("<<CARD:WEBSEARCH_SUMMARIZE@2.0>>");
    });

    it('user message 應該是有效的 JSON', () => {
      const result = buildSimpleMessage("analyze_and_recommend", "穿搭建議");
      
      expect(() => JSON.parse(result.messages[2].content)).not.toThrow();
      
      const envelope = JSON.parse(result.messages[2].content);
      expect(envelope.intent).toBeDefined();
      expect(envelope.audit).toBeDefined();
    });
  });

  describe('Audit 資訊測試', () => {
    
    it('應該記錄路由決策資訊', () => {
      const result = buildSimpleMessage("travel_plan", "旅行計劃", {
        destinations: ["Seoul, KR"],
        date_range: { start: "2025-09-20", end: "2025-09-25" }
      });
      
      const envelope = JSON.parse(result.messages[2].content);
      expect(envelope.audit.routing_notes).toContain("mode: travel_plan");
      expect(envelope.audit.routing_notes.some((note: string) => 
        note.includes("useWeather: true")
      )).toBe(true);
    });

    it('應該記錄使用的卡片清單', () => {
      const result = buildSimpleMessage("trend_summary", "流行趨勢");
      
      const envelope = JSON.parse(result.messages[2].content);
      const cardsNote = envelope.audit.routing_notes.find((note: string) => 
        note.startsWith("cards:")
      );
      expect(cardsNote).toContain("MODE_TREND@1.0");
      expect(cardsNote).toContain("WEBSEARCH_SUMMARIZE@2.0");
    });

    it('應該記錄路由警告', () => {
      const result = buildSimpleMessage("analyze_and_recommend", "台北天氣穿搭", {
        destinations: ["Taipei, TW"]  // 有地點但無日期
      });
      
      const envelope = JSON.parse(result.messages[2].content);
      expect(envelope.audit.warnings).toContain("location_without_date_range");
    });
  });

  describe('邊界情況測試', () => {
    
    it('應該處理空的輸入', () => {
      const result = buildSimpleMessage("analyze_and_recommend", "");
      
      expect(result.validation_errors).toHaveLength(0);
      expect(result.cards_used).toContain("SAFETY_COMPLIANCE@1.0");
    });

    it('應該處理複雜的混合情境', () => {
      const result = buildSimpleMessage("analyze_and_recommend", "去巴黎參加婚禮穿什麼", {
        weather: true,
        rag: true,
        destinations: ["Paris, FR"],
        date_range: { start: "2025-09-20", end: "2025-09-22" }
      });
      
      // 應該路由到 travel_plan（旅行優先）
      expect(result.routing.mode).toBe("travel_plan");
      expect(result.routing.useWeather).toBe(true);
      expect(result.cards_used).toContain("MODE_TRAVEL@1.0");
      expect(result.cards_used).toContain("WEATHER_RULES@2.0");
    });
  });
});

describe('整合測試', () => {
  
  it('應該能夠處理完整的 envelope', () => {
    const envelope = {
      intent: {
        mode: "trend_summary" as const,
        text_query: "2025年韓國時尚趨勢",
        needs_weather: false,
        needs_rag: false
      },
      search_evidence: [
        {
          title: "2025韓國時尚週重點",
          content: "清新自然風格持續主導市場",
          url: "https://example.com/korean-fashion-2025",
          publishedAt: "2025-01-15"
        }
      ],
      preferences: {
        style_whitelist: ["清新韓系 (Fresh Korean)", "極簡 (Minimalist)"]
      }
    };

    const result = buildMessages(envelope);
    
    expect(result.routing.mode).toBe("trend_summary");
    expect(result.routing.useWebSearch).toBe(true);
    expect(result.validation_errors).toHaveLength(0);
    
    const userMessage = JSON.parse(result.messages[2].content);
    expect(userMessage.search_evidence).toBeDefined();
    expect(userMessage.preferences.style_whitelist).toContain("清新韓系 (Fresh Korean)");
  });
});

// 開發除錯用的測試（可選執行）
describe.skip('除錯測試', () => {
  
  it('列印各種模式的 message 結構', () => {
    console.log("\n=== ANALYZE MODE ===");
    debugMessages(buildSimpleMessage("analyze_and_recommend", "約會穿搭"));
    
    console.log("\n=== TREND MODE ===");
    debugMessages(buildSimpleMessage("trend_summary", "今年流行趨勢"));
    
    console.log("\n=== TRAVEL MODE ===");
    debugMessages(buildSimpleMessage("travel_plan", "東京5天旅遊", {
      destinations: ["Tokyo, JP"],
      date_range: { start: "2025-09-20", end: "2025-09-25" },
      weather: true
    }));
    
    console.log("\n=== RERANK MODE ===");
    debugMessages(buildSimpleMessage("rerank", "重排這些商品"));
  });
});