# 圖片智能推薦系統 API 文檔

## 概述

圖片智能推薦系統是 STYLEMATE v2.0 的核心新功能，結合 Qwen2-VL 多模態視覺模型與 Fashion-CLIP 語義檢索技術，為用戶提供基於圖片的個人化服裝推薦。

## 系統架構

```mermaid
graph TB
    A[前端圖片上傳] --> B[API Gateway]
    B --> C[Qwen2-VL 分析引擎]
    C --> D[標準化JSON輸出]
    D --> E[Fashion-CLIP 檢索]
    E --> F[PostgreSQL + pgvector]
    F --> G[推薦結果排序]
    G --> H[前端展示]
    
    I[商品向量化] --> F
    J[圖片特徵提取] --> E
```

## 核心 API 端點

### 1. 智能圖片推薦 API

**端點**: `POST /api/intelligent-recommend`

**功能**: 基於上傳圖片進行智能商品推薦

#### 請求參數

```typescript
interface IntelligentRecommendRequest {
  image: string;              // base64編碼的圖片數據
  user_message?: string;      // 可選的文字描述
  analysis_type: 'body_shape' | 'outfit' | 'single_item';
  preferences?: {
    budget_range?: [number, number];
    occasions?: string[];
    style_preference?: string[];
    size_preference?: string;
  };
  session_id?: string;        // 會話ID，用於狀態管理
}
```

#### 回應格式

```typescript
interface IntelligentRecommendResponse {
  success: boolean;
  analysis: QwenVLAnalysis;
  recommendations: ProductRecommendation[];
  search_info: SearchMetadata;
  error?: string;
}

interface QwenVLAnalysis {
  analysis_type: string;
  scene_description: string;
  body_features?: {
    shape_type: string;
    proportions: string;
    recommendations: string;
  };
  style_preferences: {
    detected_style: string[];
    color_palette: string[];
    patterns: string[];
  };
  search_queries: string[];
  constraints: string[];
}

interface ProductRecommendation {
  product_id: number;
  name: string;
  similarity_score: number;
  reason: string;
  image_url: string;
  price: number;
  category: string;
  style_tags: string[];
}
```

#### 使用範例

```javascript
const response = await fetch('/api/intelligent-recommend', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
    user_message: '我需要適合約會的穿搭',
    analysis_type: 'body_shape',
    preferences: {
      budget_range: [1000, 5000],
      occasions: ['date', 'casual'],
      style_preference: ['korean', 'elegant']
    }
  })
});

const result = await response.json();
console.log('推薦結果:', result.recommendations);
```

### 2. Fashion-CLIP 語義搜尋 API

**端點**: `POST /api/fashion-clip/search`

**功能**: 基於文字或圖片進行語義搜尋

#### 請求參數

```typescript
interface FashionClipSearchRequest {
  query: string;              // 搜尋查詢（文字或base64圖片）
  type: 'text' | 'image';    // 查詢類型
  limit?: number;             // 返回結果數量限制（默認10）
  minSimilarity?: number;     // 最小相似度閾值（默認0.7）
  category_filter?: string[]; // 類別過濾
  price_range?: [number, number]; // 價格範圍過濾
}
```

#### 回應格式

```typescript
interface FashionClipSearchResponse {
  success: boolean;
  results: SearchResult[];
  query: string;
  searchType: string;
  totalResults: number;
  searchInfo: {
    encodingModel: string;
    minSimilarity: number;
    maxResults: number;
    searchTime: string;
  };
}

interface SearchResult {
  id: number;
  name_zh: string;
  name_en: string;
  similarity: number;
  distance: number;
  category_zh: string;
  price_twd: number;
  style_tags_zh: string[];
  image_url: string;
}
```

#### 使用範例

```javascript
// 文字搜尋
const textSearch = await fetch('/api/fashion-clip/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: '韓系 優雅 約會洋裝',
    type: 'text',
    limit: 8,
    minSimilarity: 0.75
  })
});

// 圖片搜尋
const imageSearch = await fetch('/api/fashion-clip/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
    type: 'image',
    limit: 10
  })
});
```

### 3. 商品向量化 API

**端點**: `POST /api/fashion-clip/vectorize`

**功能**: 將商品資料向量化並存入資料庫

#### 請求參數

```typescript
interface VectorizeRequest {
  batch_size?: number;        // 批次處理大小（默認10）
  force_update?: boolean;     // 是否強制更新已存在的向量
  product_ids?: number[];     // 指定商品ID列表（可選）
}
```

#### 使用範例

```javascript
const vectorize = await fetch('/api/fashion-clip/vectorize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    batch_size: 20,
    force_update: false
  })
});
```

## Qwen2-VL 系統提示詞

### 標準化分析格式

Qwen2-VL 模型使用以下系統提示詞確保輸出格式一致：

```plaintext
你是專業的AI時尚顧問，負責分析用戶圖片與穿搭需求。
請嚴格按照以下JSON格式輸出分析結果，不要有任何多餘文字。

輸出格式：
{
  "analysis_type": "body_shape|outfit|single_item",
  "scene_description": "場合描述，例如：辦公室正式場合",
  "body_features": {
    "shape_type": "梨形|蘋果形|沙漏形|矩形",
    "proportions": "上半身比例描述",
    "recommendations": "身形穿搭建議"
  },
  "style_preferences": {
    "detected_style": ["優雅", "韓系", "休閒"],
    "color_palette": ["深藍", "米白", "粉色"],
    "patterns": ["純色", "條紋", "碎花"]
  },
  "search_queries": [
    "韓系 上班族 正式洋裝",
    "修身 A字裙 深色系", 
    "通勤 優雅 外套"
  ],
  "constraints": [
    "避免過緊身形",
    "適合辦公場合", 
    "修飾腰線"
  ]
}

注意：
1. 僅輸出JSON，無需解釋
2. search_queries 必須是可檢索的關鍵詞組合
3. 所有文字使用繁體中文
```

## 資料庫架構

### PostgreSQL + pgvector 設計

```sql
-- 商品表
CREATE TABLE fashion_items (
    id SERIAL PRIMARY KEY,
    name_zh VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    category_zh VARCHAR(100),
    category_en VARCHAR(100),
    price_twd INTEGER,
    description_zh TEXT,
    style_tags_zh TEXT[], -- PostgreSQL 陣列類型
    colors_zh TEXT[],
    occasion_zh TEXT[],
    embedding_vector vector(512), -- pgvector 向量類型
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 向量索引（加速搜尋）
CREATE INDEX ON fashion_items 
USING ivfflat (embedding_vector vector_cosine_ops) 
WITH (lists = 100);

-- 用戶搜尋記錄表
CREATE TABLE user_search_history (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255),
    search_type VARCHAR(50), -- 'text', 'image', 'intelligent'
    query_data JSON,
    results JSON,
    user_feedback INTEGER, -- 用戶評分 1-5
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 錯誤處理

### 常見錯誤碼

| 錯誤碼 | 說明 | 解決方案 |
|--------|------|----------|
| `INVALID_IMAGE` | 圖片格式不正確或損壞 | 檢查圖片格式，重新上傳 |
| `MODEL_UNAVAILABLE` | AI 模型服務不可用 | 使用備用搜尋方案 |
| `VECTOR_DB_ERROR` | 向量資料庫連接錯誤 | 檢查 PostgreSQL 連接 |
| `NO_RESULTS_FOUND` | 未找到符合條件的商品 | 降低相似度閾值或擴大搜尋範圍 |
| `QUOTA_EXCEEDED` | API 配額超限 | 等待配額重置或升級方案 |

### 錯誤回應格式

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  error_code: string;
  message: string;
  timestamp: string;
  suggestions?: string[];
}
```

## 效能優化

### 1. 快取策略
- **Redis 快取**: 熱門查詢結果快取 30 分鐘
- **向量快取**: 商品向量結果本地快取
- **圖片快取**: CDN 快取商品圖片

### 2. 資料庫優化
```sql
-- 向量搜尋優化索引
CREATE INDEX CONCURRENTLY fashion_items_embedding_idx 
ON fashion_items USING ivfflat (embedding_vector vector_cosine_ops)
WITH (lists = 100);

-- 分類搜尋索引
CREATE INDEX fashion_items_category_idx ON fashion_items (category_zh);

-- 價格範圍索引
CREATE INDEX fashion_items_price_idx ON fashion_items (price_twd);
```

### 3. API 限流
```javascript
// Express.js 限流配置
const rateLimit = require('express-rate-limit');

const intelligentRecommendLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 20, // 每個 IP 最多 20 次請求
  message: 'API 請求過於頻繁，請稍後再試'
});
```

## 監控與分析

### 1. 關鍵指標
- **推薦準確率**: 用戶點擊率 > 15%
- **搜尋響應時間**: API 回應 < 3 秒
- **系統可用性**: 正常運行時間 > 99%
- **用戶滿意度**: 平均評分 > 4.0

### 2. 日誌格式
```json
{
  "timestamp": "2024-01-01T10:00:00Z",
  "level": "INFO",
  "service": "intelligent-recommend",
  "user_id": "user_123",
  "session_id": "session_456",
  "request_id": "req_789",
  "analysis_type": "body_shape",
  "processing_time": "2.3s",
  "similarity_scores": [0.89, 0.84, 0.78],
  "result_count": 8
}
```

## 部署指南

### 1. Docker Compose 配置

```yaml
version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg15
    environment:
      POSTGRES_DB: stylemate_fashion
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      POSTGRES_CONNECTION_STRING: postgresql://postgres:password@postgres:5432/stylemate_fashion
      REDIS_URL: redis://redis:6379
      QWEN_VL_API_KEY: ${QWEN_VL_API_KEY}
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

### 2. 生產環境部署檢查表

- [ ] PostgreSQL + pgvector 資料庫設置
- [ ] 商品向量化初始化
- [ ] AI 模型 API 金鑰配置
- [ ] Redis 快取服務啟動
- [ ] 圖片 CDN 配置
- [ ] SSL 證書設置
- [ ] 監控與告警系統
- [ ] 備份策略制定

## 測試指南

### 1. 單元測試

```javascript
// 測試 Qwen2-VL 分析結果格式
describe('Qwen2-VL Analysis', () => {
  test('should return valid JSON format', async () => {
    const result = await qwenVLAnalyze(testImage);
    expect(result).toHaveProperty('analysis_type');
    expect(result).toHaveProperty('search_queries');
    expect(Array.isArray(result.search_queries)).toBe(true);
  });
});

// 測試 Fashion-CLIP 搜尋
describe('Fashion-CLIP Search', () => {
  test('should return similar products', async () => {
    const result = await fashionClipSearch('韓系洋裝');
    expect(result.success).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].similarity).toBeGreaterThan(0.7);
  });
});
```

### 2. 整合測試

```javascript
// 端到端測試流程
describe('Intelligent Recommend Flow', () => {
  test('complete image recommendation flow', async () => {
    // 1. 上傳圖片
    const uploadResponse = await request(app)
      .post('/api/intelligent-recommend')
      .send({
        image: testImageBase64,
        analysis_type: 'body_shape'
      });
    
    expect(uploadResponse.status).toBe(200);
    expect(uploadResponse.body.success).toBe(true);
    expect(uploadResponse.body.recommendations).toBeDefined();
  });
});
```

---

## 更新歷史

| 版本 | 日期 | 更新內容 |
|------|------|----------|
| v2.0.0 | 2024-01-01 | 初始版本，支援圖片智能推薦 |
| v2.0.1 | 2024-01-15 | 新增錯誤處理與快取策略 |
| v2.0.2 | 2024-02-01 | 效能優化與監控功能 |

---

此文檔持續更新中，如有問題請參考 [開發者社群](https://github.com/stylemate/issues) 或聯繫技術支援團隊。