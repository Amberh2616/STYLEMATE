# STYLEMATE Prompts 架構說明

## 設計原則

基於 **Master System + Mode Cards + 嚴格路由** 的架構，確保多提示詞不會互相衝突。

### 核心概念
- **Master System Prompt**: 全局規則、優先級、輸出約束
- **Mode Cards**: 按需注入的專門功能卡片
- **嚴格路由**: 決策表 + 決策樹 + 防呆條件

### 優先級順序
```
Platform/System > Safety/Compliance > Mode Card > Schema/格式 > Business Rules > Examples
```

## 檔案結構

```
backend/prompts/
├── master/
│   └── system.ts          # Master System Prompt
├── cards/
│   ├── modes/
│   │   ├── analyze.ts     # Analyze & Recommend 卡
│   │   ├── trend.ts       # Trend Summary 卡  
│   │   ├── travel.ts      # Travel Plan 卡
│   │   └── rerank.ts      # Rerank 卡
│   ├── features/
│   │   ├── weather.ts     # Weather 規則卡
│   │   ├── rag.ts         # Expert RAG 卡
│   │   └── search.ts      # WebSearch 卡
│   └── safety/
│       └── compliance.ts  # 安全與合規卡
├── router/
│   ├── decision.ts        # 決策邏輯
│   └── priority.ts        # 優先級管理
└── builder/
    └── promptBuilder.ts   # 提示詞組裝器
```

## 使用方式

```typescript
import { buildMessages } from './builder/promptBuilder';

const messages = buildMessages({
  intent: { mode: "trend_summary", needs_weather: false, needs_rag: false },
  search_evidence: [...],
  preferences: {...}
});
```