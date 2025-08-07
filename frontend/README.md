# STYLEMATE Frontend

韓國服裝虛擬試穿平台的前端應用，採用莫蘭迪色系設計風格。

## 技術棧

- **框架**: Next.js 14 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **狀態管理**: Zustand
- **表單處理**: React Hook Form + Zod
- **圖像處理**: Fabric.js
- **HTTP 客戶端**: Axios

## 設計風格

- **色彩系統**: 紫+灰莫蘭迪色系
- **主色調**: 柔和薰衣草紫 (#8B7CC8)
- **輔助色**: 暖調灰 (#A8A5A0) 和冷調灰 (#9B9B9B)
- **背景色**: 奶油白 (#F5F4F2)

## 開始使用

### 1. 安裝依賴

```bash
npm install
```

### 2. 環境變數設定

```bash
cp .env.example .env.local
```

編輯 `.env.local` 檔案，設定必要的環境變數。

### 3. 啟動開發伺服器

```bash
npm run dev
```

應用會在 [http://localhost:3000](http://localhost:3000) 啟動。

## 專案結構

```
frontend/
├── app/                     # Next.js App Router 頁面
│   ├── globals.css         # 全域樣式
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首頁
│   ├── tryon/              # 虛擬試穿頁
│   ├── products/           # 商品頁
│   └── checkout/           # 結帳頁
├── components/             # React 組件
│   ├── forms/              # 表單組件
│   ├── ui/                 # 基礎 UI 組件
│   ├── canvas/             # 畫布組件
│   └── layout/             # 版面組件
├── lib/                    # 工具函數
├── store/                  # 狀態管理
├── types/                  # TypeScript 類型
└── public/                 # 靜態資源
```

## 核心功能

### 1. 風格偏好表單
- 多選風格類型（K-pop、日常韓系、正式場合、清新學院風）
- 照片拖拽上傳（支援 JPEG、PNG、WebP）
- 基本資訊輸入（身高、體型）
- 表單驗證使用 Zod schema

### 2. 虛擬試穿畫布
- 基於 Fabric.js 的 2D 圖像合成
- 拖拽調整服裝位置
- 縮放調整服裝大小
- 試穿結果匯出

### 3. 商品瀏覽
- 響應式商品網格
- 圖片懶載入
- 篩選和搜尋功能
- 無限滾動

### 4. 購物車與結帳
- 多步驟結帳流程
- 即時價格計算
- 多種付款方式

## 開發指令

```bash
# 開發環境
npm run dev

# 建構專案
npm run build

# 啟動生產版本
npm run start

# 程式碼檢查
npm run lint

# 型別檢查
npm run type-check
```

## 色彩系統

### 主色調
- `primary-500`: #8B7CC8 (柔和薰衣草紫)
- `primary-600`: #6B5D8C (深薰衣草紫)
- `primary-300`: #AEA4D6 (霧紫色)

### 輔助色
- `secondary-400`: #A8A5A0 (暖調灰)
- `secondary-500`: #9B9B9B (冷調灰)
- `secondary-600`: #6B6B6B (深灰)

### 中性色
- `neutral-cream`: #F5F4F2 (奶油白)
- `neutral-white`: #FEFEFE (純白)
- `neutral-dark`: #3A3A3A (深色)

## 組件使用範例

### StyleForm 組件

```tsx
import StyleForm from '@/components/forms/StyleForm'

<StyleForm
  onSubmit={handleSubmit}
  isLoading={loading}
/>
```

### PhotoUpload 組件

```tsx
import PhotoUpload from '@/components/forms/PhotoUpload'

<PhotoUpload
  onUpload={handleFileUpload}
  maxSize={10}
  acceptedTypes={['image/jpeg', 'image/png']}
/>
```

## 自定義 CSS 類別

### 按鈕
- `.btn-primary`: 主要按鈕樣式
- `.btn-secondary`: 次要按鈕樣式

### 卡片
- `.card`: 基礎卡片樣式
- `.gradient-card`: 漸層背景卡片

### 表單
- `.input`: 輸入框樣式
- `.checkbox`: 自定義複選框
- `.upload-zone`: 檔案上傳區域

## 響應式設計

採用 Mobile First 設計原則：

- **Mobile**: 375px+
- **Tablet**: 768px+
- **Desktop**: 1024px+

## 效能優化

- 圖片懶載入
- 程式碼分割
- 組件記憶化
- 樹搖優化

## 瀏覽器支援

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 開發注意事項

1. 遵循 TypeScript 嚴格模式
2. 使用 ESLint 和 Prettier 保持程式碼品質
3. 組件需支援 SSR
4. 圖片需提供 alt 屬性
5. 遵循 WCAG 無障礙標準

## 部署

### Vercel 部署

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 環境變數設定

在部署平台設定以下環境變數：

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

## 貢獻指南

1. Fork 此專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 授權

本專案採用 MIT 授權條款。