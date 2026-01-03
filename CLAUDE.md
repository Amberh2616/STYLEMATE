# Claude Code 專案記憶

此檔案儲存 Claude Code 的專案相關資訊和設定。

## 專案概述
**STYLEMATE** - 韓式時尚平台，具備 AI 虛擬試穿功能
- Next.js 14.0.0 + TypeScript 5.9.2
- OpenAI GPT-4o Mini 整合
- RAG 知識庫系統 (Pinecone + LangChain)
- Hugging Face Space 虛擬試穿
- WebSearch 專業時尚媒體分析系統
- Intent Parser 智能查詢識別 (4種模式)
- 天氣資訊整合 (OpenWeatherMap)
- 9 個商品展示 + 智能語義搜尋

## 技術棧
### 前端 (Frontend)
- **框架**: Next.js 14.0.0
- **語言**: TypeScript 5.9.2
- **樣式**: TailwindCSS 3.3.0
- **UI 庫**: HeadlessUI, Heroicons
- **表單**: React Hook Form + Zod 驗證
- **狀態管理**: Zustand 4.4.0
- **虛擬試穿**: Hugging Face Space (amber2616/STYLEMATE) + Gradio Client
- **AI 整合**: OpenAI GPT-4o Mini, Langchain 0.3.30
- **圖像處理**: Sharp 0.34.3 (備援處理)

### 後端 (Backend)
- **運行時**: Node.js 18+
- **框架**: Express.js 4.19.2
- **語言**: TypeScript (ESM)
- **資料庫**: PostgreSQL + pgVector
- **AI 服務**: OpenAI API, Hugging Face
- **網頁爬取**: Cheerio, Readability
- **測試**: Jest + ts-jest

### 開發工具
- **建構工具**: Next.js, TSC
- **代碼品質**: ESLint, Prettier
- **包管理器**: npm
- **開發伺服器**: tsx (TypeScript execution)

## 常用指令
```bash
# 啟動開發伺服器
cd frontend && npm run dev

# 啟動 WebSearch 趨勢分析服務
npm run search

# 測試 OpenAI 連接
curl -X POST http://localhost:3002/api/test-ai -H "Content-Type: application/json" -d "{}"

# 檢查構建與代碼品質
npm run build
npm run lint
npm run type-check  # 前端
npm run test        # 後端測試
```

## 專案結構
### 核心目錄
```
STYLEMATE/
├── frontend/              # Next.js 前端應用
│   ├── app/              # App Router 結構
│   │   ├── api/          # API 路由
│   │   ├── chat/         # 聊天頁面 (主推薦)
│   │   ├── chat-3/       # 趨勢分析聊天
│   │   ├── tryon/        # 虛擬試穿
│   │   ├── admin/        # 管理後台
│   │   └── member/       # 用戶中心
│   ├── components/       # React 組件
│   ├── lib/              # 工具函數與核心邏輯
│   └── public/           # 靜態資源
├── backend/              # Express.js 後端服務
│   ├── services/         # 業務邏輯服務
│   ├── prompts/          # AI 提示語系統
│   └── llm/              # LLM 相關工具
├── fashion_dataset/      # 時尚數據集
└── docs/                 # 項目文檔
```

## 重要檔案路徑
### 前端核心文件
- **主聊天頁面**: `/frontend/app/chat/page.tsx`
- **趨勢聊天頁面**: `/frontend/app/chat-3/page.tsx`
- **商品數據**: `/frontend/lib/products.ts`
- **OpenAI API**: `/frontend/app/api/chat/recommend/route.ts`
- **Intent Parser**: `/frontend/lib/core/intentParser.ts`
- **Intent Rules**: `/frontend/lib/core/intentRules.ts`
- **天氣分析器**: `/frontend/lib/travelWeatherAnalyzer.ts`

### 後端核心文件
- **主服務器**: `/backend/server.ts`
- **WebSearch 服務**: `/backend/services/search/`
- **提示語系統**: `/backend/prompts/`
- **天氣服務**: `/backend/services/weather/`

### API 端點
#### 前端 API 路由 (`/frontend/app/api/`)
- `GET/POST /api/chat/recommend` - 主推薦聊天 API
- `GET/POST /api/rag/search` - RAG 知識庫搜尋
- `POST /api/rag/upload-pdf` - PDF 上傳
- `POST /api/tryon/route` - 虛擬試穿
- `GET/POST /api/fashion/search` - 時尚商品搜尋
- `GET/POST /api/member/profile` - 用戶資料
- `POST /api/test-ai` - OpenAI 連接測試

#### 後端 WebSearch 服務 (端口 3001)
- `POST /search` - 時尚趨勢搜尋
- `GET /health` - 健康檢查

## 環境設定
### 必要環境變數 (`/frontend/.env.local`)
```env
# OpenAI 設定
OPENAI_KEY=sk-proj-xxx                     # OpenAI API 主密鑰
OPEN_AI_API_KEY=sk-proj-xxx               # OpenAI 備用密鑰

# 天氣服務
OPENWEATHER_API_KEY=455876f28d25097e3b726ee5ccaca15a

# AI 服務
GROQ_API_KEY=gsk_xxx                      # GROQ API 密鑰
HUGGING_FACE_API_TOKEN=hf_xxx            # Hugging Face API Token
REPLICATE_API_TOKEN=r8_xxx                # Replicate API Token

# 虛擬試穿設定
TRYON_BACKEND=hf_space                    # 使用 HF Space
HF_SPACE_ID=amber2616/STYLEMATE          # HF Space ID
HF_TOKEN=hf_xxx                           # HF Token

# 向量資料庫 (如需要)
PINECONE_API_KEY=xxx                     # Pinecone API 密鑰
POSTGRES_URL=xxx                         # PostgreSQL 連接字符串
```

## 開發流程
1. **啟動服務**：`npm run search` + `cd frontend && npm run dev`
2. **測試功能**：
   - 主聊天功能：http://localhost:3002/chat
   - 趨勢分析：http://localhost:3002/chat-3
   - RAG 管理：http://localhost:3002/admin/rag
   - 虛擬試穿：http://localhost:3002/tryon
3. **代碼品質檢查**：運行 `npm run lint` 和 `npm run type-check`
4. **測試**：後端 `npm run test`，前端無獨立測試套件

## 功能狀態（2026-01-03 更新）

### ✅ 已完成功能

#### 基礎功能
- **WebSearch 趨勢分析** - 完全運作，支援專業時尚媒體爬取 (Vogue、ELLE、Hypebeast等)
- **Intent Parser 系統** - 智能識別 4 種模式：商品推薦、趨勢分析、旅行規劃、重新排序
- **智能語義搜尋** - 基於規則的語義分析引擎，模擬 Fashion-CLIP 效果
- **商品推薦系統** - 支援任意數量商品展示 + 多維度標籤匹配
- **RAG 知識庫** - PDF 上傳、向量化存儲與語義搜尋
- **多模態 AI 分析** - GPT-4o Mini 圖像理解 + 文字處理
- **用戶系統** - 20 個問題的用戶偏好設定
- **天氣整合系統** - OpenWeatherMap 5天預報 + 智能穿搭建議

#### BE 27 Studio 穿搭工作室（NEW - 95%完成）✨

**白板畫布系統**
- ✅ 自由拖拽商品到畫布任意位置
- ✅ 多選功能（Ctrl/Cmd + Click）
- ✅ 圈選工具（框選多個商品）
- ✅ 縮放與位置調整
- ✅ 左側對話框（可收起）
- ✅ 右側組合面板（價格+試穿）
- 檔案：`/frontend/app/studio/page.tsx`

**LOOK 組合功能**
- ✅ 將選中商品組成 LOOK
- ✅ LOOK 卡片展示（名稱、價格、商品縮圖）
- ✅ 編輯 LOOK 名稱
- ✅ 刪除 LOOK
- ✅ 一鍵清空畫布

**虛擬試穿整合**
- ✅ 試穿彈窗（選擇 LOOK → 上傳照片 → 試穿）
- ✅ 兩步試穿法（上衣 → 下身）
- ✅ 支援單件或多件商品
- ✅ 試穿結果下載
- ✅ 試穿結果加入白板
- ✅ base64 圖片支援修復
- API：`/api/tryon`（Gemini 2.5 Flash）

**Django 後端整合**
- ✅ Django REST API（81 個商品）
- ✅ Product Model 雙圖片系統
- ✅ rembg 去背服務
- ✅ 分類查詢 API
- ✅ 統計資訊 API
- 後端路徑：`/be27_backend/`

#### BE 27 Chat 對話模式（95%完成）

**對話介面**
- ChatGPT 風格介面（左側對話記錄，右側推薦）
- 智能商品推薦（LLM 驅動）
- 商品多選功能（Checkbox）
- 前往穿搭工作室按鈕
- 檔案：`/frontend/app/chat/page.tsx`

**購物車系統（80%完成）**
- Zustand Store 狀態管理
- 支援單品與整套 LOOK
- 試穿照片關聯
- 套裝折扣機制（95折）
- Store：`/store/cartStore.ts`
- ❌ UI 頁面待實現
- ❌ 結帳流程待實現

### 🚧 開發中功能
- **購物車頁面 UI** - 列表展示、數量調整、刪除功能
- **結帳流程** - 收件資訊、付款方式、訂單確認
- **男款商品導入** - AI 自動分析+去背+寫入 Django

### 📋 TODO 清單（2026-01-03 更新）

#### 🔴 P0：核心功能完善
1. ✅ ~~虛擬試穿兩步法~~ (已完成)
2. ✅ ~~試穿結果加入白板~~ (已完成)
3. ✅ ~~Django 後端整合~~ (已完成)
4. 🚧 購物車頁面 UI 實現
5. 🚧 完整結帳流程

#### 🟠 P1：男款商品系統
6. 建立 AI 自動導入命令 (`ai_import.py`)
7. Gemini Vision 圖片分析（名稱、類別、風格、顏色）
8. 自動 rembg 去背
9. 批量導入到 Django
10. 新增 `gender` 欄位或使用 `men_*` 前綴

#### 🟡 P2：優化與擴展
11. 試穿 prompt 優化（縮短生成時間）
12. 下身試穿準確度改進
13. 白板截圖功能優化
14. LOOK 分享功能

#### 🟢 P3：未來功能
15. 一周穿搭規劃
16. 藝術照生成
17. 社群分享功能

## 功能模塊詳細

### WebSearch 趨勢分析系統
- **功能狀態**: ✅ 完全運作
- **主要搜尋**: 專業時尚媒體爬取 (Vogue、ELLE、GQ、Hypebeast、Fashionista)
- **備援搜尋**: Tavily Search API → OpenAI GPT-4o Mini 直接生成
- **支援查詢**: 時裝週動態、流行趨勢、色彩分析、街頭潮流、設計師品牌
- **回應格式**: 450-600字、結構化分段、包含來源網址
- **測試地址**: http://localhost:3002/chat-3
- **技術實現**: Cheerio 爬取 → Readability 內容提取 → GPT-4o Mini 分析

### Intent Parser 智能查詢系統
- **4 種模式**: analyze_and_recommend | trend_summary | travel_plan | rerank
- **查詢精確度**: 排除時裝週語境的旅行誤判、支援多模態輸入
- **地點識別**: 全球城市白名單 + 時間範圍解析
- **核心檔案**: `/frontend/lib/core/intentParser.ts` + `intentRules.ts`

### 智能語義搜尋系統 (Fashion-CLIP 替代)
- **語義規則引擎**: 11種色彩系統 + 6大服裝類型 + 風格場合分析
- **評分機制**: 色彩(+1.0) → 類別(+0.8) → 關鍵字(+0.6) → 風格/場合(+0.4)
- **特殊情境**: 下雨天推薦、約會推薦、上班推薦等智能場景
- **API 端點**: `/api/fashion-clip/demo-search` (主要) + `/api/fashion-clip/encode` (備用)

### 虛擬試穿系統
- **AI 服務**: Hugging Face Space `amber2616/STYLEMATE`
- **客戶端**: Gradio Client 1.17.0
- **API 流程**: 用戶照片 + 商品圖 → `/tryon` 端點 → AI 模型處理 → 返回試穿結果
- **備援處理**: Sharp 圖像合成 (伺服器端 Canvas 疊圖)
- **結果展示**: React 專用頁面 `/tryon`

### RAG 知識庫系統
- **向量化**: OpenAI `text-embedding-ada-002` (RAG 主用) + `text-embedding-3-small` (備用)
- **向量資料庫**: Pinecone 6.1.2 + PostgreSQL pgVector (備用)
- **文件處理**: pdf-parse 1.1.1 + LangChain 0.3.30
- **功能流程**: PDF 上傳 → 向量化存儲 → 語義搜尋 → 上下文整合回答

## 實際使用的 AI 模型

### ✅ 主要模型
- **OpenAI GPT-4o Mini**: 主要語言模型，所有對話、分析、圖像理解功能
- **OpenAI text-embedding-ada-002**: RAG 向量化主用模型
- **OpenAI text-embedding-3-small**: Fashion-CLIP 備用、RAG 備用模型
- **Hugging Face Space**: amber2616/STYLEMATE 虛擬試穿 AI 模型

### ⚠️ 已設定但未啟用
- **Fashion-CLIP patrickjohncyh/fashion-clip**: 有 API 實現但響應超時，使用智能語義規則引擎替代
- **Replicate**: 有 Token 設定但主要使用 HF Space
- **GROQ**: 有 API Key 但未在主要功能中使用

## 注意事項
- **伺服器端口**: 前端 3002，WebSearch 後端 3001
- **圖片路徑**: 使用 `/images/products/` 開頭的相對路徑
- **OpenAI API**: 主要使用 OPENAI_KEY，備用 OPEN_AI_API_KEY
- **虛擬試穿**: 直接連接 Hugging Face Space，需要 HF_TOKEN
- **RAG 功能**: 需要先上傳 PDF 才能使用知識庫搜尋
- **代碼規範**: 使用 ESLint + Prettier，TypeScript 嚴格模式
- **測試覆蓋**: 後端有 Jest 測試，前端主要靠手動測試

## 開發備註
- Next.js 使用 App Router 架構 (非 Pages Router)
- 後端使用 ES Modules (type: "module")
- 所有 TypeScript 配置都已優化
- 使用 Zustand 進行前端狀態管理
- PostgreSQL 需要 pgVector 擴展支援向量搜尋
- Sharp 用於圖像處理，需要原生編譯支援