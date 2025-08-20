# Claude Code 專案記憶

此檔案儲存 Claude Code 的專案相關資訊和設定。

## 專案概述
**STYLEMATE** - 韓式時尚平台，具備 AI 虛擬試穿功能
- Next.js 14.2.31 + TypeScript
- OpenAI GPT-4 整合
- RAG 知識庫系統
- 虛擬試穿技術
- WebSearch 時尚趨勢分析系統
- Intent Parser 智能查詢識別
- 天氣資訊整合
- 9 個商品展示 + 標籤系統

## 技術棧
### 前端 (Frontend)
- **框架**: Next.js 14.0.0
- **語言**: TypeScript 5.9.2
- **樣式**: TailwindCSS 3.3.0
- **UI 庫**: HeadlessUI, Heroicons
- **表單**: React Hook Form + Zod 驗證
- **狀態管理**: Zustand 4.4.0
- **虛擬試穿**: Fabric.js + MediaPipe
- **AI 整合**: OpenAI GPT-4, Langchain
- **圖像處理**: Sharp, Replicate

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
OPENAI_API_KEY=sk-xxx           # OpenAI API 密鑰
NEXT_PUBLIC_API_URL=http://localhost:3002  # 前端 API URL
WEBSEARCH_URL=http://localhost:3001        # WebSearch 服務 URL
POSTGRES_URL=xxx                # PostgreSQL 連接字符串
PINECONE_API_KEY=xxx            # Pinecone API 密鑰
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

## 功能狀態
### ✅ 已完成功能
- **WebSearch 趨勢分析** - 完全運作，支援專業時尚媒體爬取
- **Intent Parser 系統** - 智能識別趨勢查詢 vs 商品推薦
- **商品推薦系統** - 9 個商品展示 + 標籤系統
- **RAG 知識庫** - PDF 上傳與搜尋功能
- **虛擬試穿** - 基礎功能實現
- **用戶系統** - 20 個問題的用戶偏好設定

### ❌ 待修復問題
- **天氣資訊顯示** - 旅行查詢無法顯示天氣建議區塊
  - Intent Parser 正確識別旅行模式
  - 商品推薦正常運作
  - 但 weatherContext 未出現在回應中
  - 可能原因：調試日誌未出現，懷疑請求未到達後端或編譯問題

## WebSearch 趨勢分析功能
- **功能狀態**: ✅ 完全運作
- **支援媒體**: Fashionista, ELLE, GQ, Hypebeast, Vogue 等專業時尚媒體
- **支援查詢**: 時裝周、流行趨勢、色彩分析、街頭潮流、設計師品牌
- **回應格式**: 450-600字、分段標題、無數字編號、包含來源網址
- **測試地址**: http://localhost:3002/chat-3
- **技術實現**: Cheerio 爬取 + Readability 內容提取 + OpenAI 分析

## 注意事項
- **伺服器端口**: 前端 3002，WebSearch 後端 3001
- **圖片路徑**: 使用 `/images/products/` 開頭的相對路徑
- **OpenAI API**: 已設定並測試通過
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