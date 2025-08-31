# STYLEMATE Prompt 系統 v2.0 - 減重版

## 🎯 減重計畫成果

**BEFORE (舊版):**
- 單一巨大 System Prompt: ~3500字
- 每次請求 tokens: ~5000+
- 維護困難，規則混雜

**AFTER (新版):**
- 核心提示詞: 200字
- 按需卡片: ≤500字  
- 壓縮證據包: ≤600字
- **總計: ≤1300字 (節省 70%)**

## 📁 目錄結構

```
backend/prompts/
├── core/
│   └── system.ts                    # 核心系統提示詞 (200字)
├── cards/
│   ├── style/
│   │   └── styleRules.ts           # 風格規則卡片 (150字)
│   ├── weather/
│   │   └── weatherRules.ts         # 天氣規則卡片 (180字)
│   └── format/
│       └── outputFormat.ts         # 格式要求卡片 (180字)
├── config/
│   └── responseLimits.ts           # 字數限制配置
├── selector/
│   └── cardSelector.ts             # 智能卡片選擇器
├── compression/
│   └── evidenceCompressor.ts       # 證據包壓縮器
├── builder/
│   ├── promptBuilder.ts            # 舊版 Builder (保留)
│   └── promptBuilderV2.ts          # 新版 Builder (主用)
└── README_V2.md                    # 說明文件
```

## 🚀 使用方式

### 基本用法
```typescript
import { buildOptimizedPrompt } from './builder/promptBuilderV2';
import { analyzeIntent } from '../../frontend/lib/core/intentParser';

// 1. 分析用戶意圖
const intent = analyzeIntent({ text: userMessage });

// 2. 建立優化提示詞
const optimizedPrompt = buildOptimizedPrompt({
  intent,
  userMessage,
  fashionItems: searchResults,
  weatherContext: weatherData,
  hasImage: !!imageBase64
});

// 3. 發送到 OpenAI
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: optimizedPrompt.messages
});
```

### 除錯模式
```typescript
import { debugOptimizedPrompt } from './builder/promptBuilderV2';

const prompt = buildOptimizedPrompt(data);
debugOptimizedPrompt(prompt); // 輸出統計資訊
```

## 📊 字數限制配置

| 回覆類型 | 最少 | 最多 | 說明 |
|---------|------|------|------|
| 商品推薦 | 300字 | 500字 | 分析+推薦+理由 |
| 天氣穿搭 | 400字 | 700字 | 天氣+材質+場合+單品 |
| 趨勢分析 | 450字 | 600字 | 趨勢+分析+應用 |
| 圖片分析 | 250字 | 600字 | 服裝+風格+搭配 |
| 一般聊天 | 150字 | 300字 | 確認+簡要建議 |

## 🃏 卡片系統

- **風格規則卡片**: 風格分類、場合、版型標準
- **天氣規則卡片**: 溫度、天氣對應穿搭原則  
- **格式卡片**: HTML格式、段落要求
- **字數限制卡片**: 動態生成的字數要求

## 🗜️ 證據包壓縮

原始資料 → 壓縮後：
- 商品列表: 保留前6個，簡化欄位
- 天氣資訊: 提取關鍵數據
- 趨勢資訊: 保留前3個要點
- RAG結果: 保留前2個，截短內容

## ✅ 遷移檢查清單

- [x] 創建核心系統提示詞
- [x] 建立卡片系統 
- [x] 實現證據包壓縮
- [x] 建立新版 Builder
- [x] 配置字數限制
- [ ] 整合到現有 API
- [ ] 測試新舊版本效果
- [ ] 監控 token 使用量
- [ ] 完全替換舊版系統

## 📈 預期效果

- **Token 節省**: 70%+ 
- **成本降低**: 70%+
- **維護性**: 大幅提升
- **功能完整性**: 100% 保留
- **回覆品質**: 保持一致