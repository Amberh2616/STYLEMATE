# STYLEMATE Prompts 使用範例

## 快速開始

```typescript
import { buildMessages, buildSimpleMessage } from './backend/prompts';

// 基本使用
const result = buildSimpleMessage("analyze_and_recommend", "適合約會的洋裝");
console.log(result.messages);  // 可直接傳給 OpenAI API
```

## 完整使用範例

### 1. 基本穿搭建議

```typescript
const envelope = {
  intent: {
    mode: "analyze_and_recommend" as const,
    text_query: "適合商務會議的專業穿搭",
    needs_rag: true  // 啟用專業禮儀規則
  },
  expert_rag: {
    positive_rules: ["商務場合建議穿著正式西裝"],
    negative_rules: ["避免過於鮮豔的顏色"],
    etiquette: ["保持整潔專業的形象"],
    size_fit_hints: ["選擇合身的版型"]
  }
};

const result = buildMessages(envelope);
```

### 2. 流行趨勢查詢（自動 WebSearch）

```typescript
const envelope = {
  intent: {
    mode: "trend_summary" as const,
    text_query: "2025年春夏韓國時尚趨勢"
  },
  search_evidence: [
    {
      title: "首爾時裝週2025春夏亮點",
      content: "清新自然風格持續主導，薄荷綠成為主流色彩...",
      url: "https://vogue.com/seoul-fashion-week-2025",
      publishedAt: "2025-03-15"
    }
  ]
};

const result = buildMessages(envelope);
// 自動注入: WEBSEARCH_SUMMARIZE + TREND_EXTRACTION 卡片
```

### 3. 旅行規劃（自動天氣）

```typescript
const envelope = {
  intent: {
    mode: "travel_plan" as const,  // 會被路由器自動識別
    text_query: "去東京5天需要帶什麼衣服",
    destinations: ["Tokyo, JP"],
    date_range: { start: "2025-09-20", end: "2025-09-25" }
  },
  weather_by_day: [
    { date: "2025-09-20", temperature: { min: 18, max: 25 }, conditions: "sunny", precipitation: 0 },
    { date: "2025-09-21", temperature: { min: 16, max: 22 }, conditions: "cloudy", precipitation: 30 },
    // ... 更多天氣資料
  ]
};

const result = buildMessages(envelope);
// 自動注入: MODE_TRAVEL + WEATHER_RULES 卡片
```

### 4. 智能路由範例

```typescript
// 這些輸入會被自動路由到正確模式：

// "今年流行什麼顏色" → trend_summary mode
// "去首爾3天穿什麼" → travel_plan mode  
// "適合約會的洋裝" → analyze_and_recommend mode
// "重排這幾件" → rerank mode

const examples = [
  "今年韓國流行趨勢",           // → trend_summary + WebSearch
  "去巴黎5天旅遊",             // → travel_plan + Weather
  "東京明天穿什麼",             // → analyze_and_recommend + Weather
  "幫我重排這些商品",           // → rerank
  "參加婚禮穿什麼",             // → analyze_and_recommend + RAG
];

examples.forEach(query => {
  const result = buildSimpleMessage("analyze_and_recommend", query);
  console.log(`"${query}" → ${result.routing.mode}`);
});
```

## 進階使用

### 自定義卡片組合

```typescript
// 如果需要手動控制卡片注入（不推薦，但有時需要）
import { 
  MASTER_SYSTEM_V12,
  CARD_MODE_ANALYZE_V11,
  CARD_WEATHER_RULES 
} from './backend/prompts';

const customMessages = [
  { role: "system", content: MASTER_SYSTEM_V12 },
  { role: "developer", content: `${CARD_MODE_ANALYZE_V11}\n\n${CARD_WEATHER_RULES}` },
  { role: "user", content: JSON.stringify(envelope) }
];
```

### 路由決策除錯

```typescript
import { routeByIntent, debugMessages } from './backend/prompts';

const intent = {
  mode: "analyze_and_recommend" as const,
  text_query: "去首爾玩今年流行什麼",
  destinations: ["Seoul, KR"],
  date_range: { start: "2025-09-20", end: "2025-09-25" }
};

const routing = routeByIntent(intent);
console.log(routing);
// 輸出: { mode: "travel_plan", useWeather: true, reasons: ["trip_detected"], ... }

// 詳細除錯
const result = buildMessages({ intent });
debugMessages(result);
```

### API 整合範例

```typescript
// 在 API 路由中使用
export async function POST(request: Request) {
  const { message, images } = await request.json();
  
  // 1. Intent 分析
  const intent = analyzeIntent({ text: message, images });
  
  // 2. 建構 envelope
  const envelope = {
    intent,
    weather_context: intent.needs_weather ? await fetchWeather(intent.destinations) : undefined,
    search_evidence: intent.mode === "trend_summary" ? await webSearch(message) : undefined,
    expert_rag: intent.needs_rag ? await queryRAG(message) : undefined
  };
  
  // 3. 生成 prompt messages
  const { messages, routing } = buildMessages(envelope);
  
  // 4. 呼叫 LLM
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: messages as any,
    response_format: { type: "json_object" }
  });
  
  return Response.json({
    result: JSON.parse(response.choices[0].message.content),
    routing: routing,
    audit: envelope.audit
  });
}
```

## 測試驗證

```typescript
import { TEST_CASES } from './backend/prompts';

// 執行所有測試案例
TEST_CASES.forEach(testCase => {
  const result = buildSimpleMessage(
    testCase.expected.mode,
    testCase.intent.text_query || ""
  );
  
  console.log(`✅ ${testCase.name}: ${result.routing.mode} (${result.routing.useWeather ? '有天氣' : '無天氣'})`);
});
```

## 最佳實踐

### 1. 總是使用 buildMessages()
```typescript
// 推薦 ✅
const result = buildMessages(envelope);

// 不推薦 ❌ (除非你知道你在做什麼)
const messages = [...];
```

### 2. 檢查 validation_errors
```typescript
const result = buildMessages(envelope);
if (result.validation_errors.length > 0) {
  console.error("路由衝突:", result.validation_errors);
}
```

### 3. 利用 audit 資訊進行除錯
```typescript
const envelope = buildMessages(envelope);
const userMessage = JSON.parse(result.messages[2].content);
console.log("路由決策:", userMessage.audit.routing_notes);
console.log("警告:", userMessage.audit.warnings);
```

### 4. 版本追蹤
```typescript
import { version } from './backend/prompts';
console.log(`Prompts version: ${version.system}`);
```

## 常見問題

### Q: 為什麼我的趨勢查詢沒有返回 WebSearch 結果？
A: 檢查是否包含趨勢關鍵字，如「趨勢」、「流行」、「時裝週」等。

### Q: 如何強制啟用天氣查詢？
A: 確保 intent 中有 `destinations` 和 `date_range`，或者 mode 是 `travel_plan`。

### Q: 卡片注入順序重要嗎？  
A: 是的，按優先級注入：Safety > Mode > Features。系統會自動處理順序。

### Q: 如何添加新的模式卡片？
A: 1) 在 `cards/modes/` 創建新卡片，2) 更新 `promptBuilder.ts` 的路由邏輯，3) 添加測試案例。