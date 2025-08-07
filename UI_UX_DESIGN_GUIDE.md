# STYLEMATE UI/UX 設計指南

## 設計理念

### 品牌定位
**"讓每個人都能輕鬆擁有韓式時尚風格"**

- **目標用戶**: 18-35歲韓流時尚愛好者
- **核心價值**: 便利、時尚、個人化
- **情感訴求**: 自信、美麗、潮流

### 設計原則
1. **簡潔直觀** - 操作流程清晰，減少用戶認知負擔
2. **視覺愉悅** - 莫蘭迪美學風格，色彩和諧
3. **響應迅速** - 快速載入，即時反饋
4. **親和易用** - 符合用戶習慣，無障礙設計

## 莫蘭迪美學風格系統

### 色彩哲學
```css
/* 主色調 - 紫色系莫蘭迪風格 */
--primary-purple: #8B7CC8;        /* 柔和薰衣草紫 - 主要操作 */
--primary-deep: #6B5D8C;          /* 深薰衣草紫 - 強調元素 */
--primary-light: #AEA4D6;         /* 霧紫色 - 次要操作 */

/* 輔助色調 - 灰色系 */
--secondary-warm: #A8A5A0;        /* 暖調灰 - 輔助背景 */
--secondary-cool: #9B9B9B;        /* 冷調灰 - 邊框線條 */
--secondary-deep: #6B6B6B;        /* 深灰 - 次要文字 */

/* 中性色調 - 莫蘭迪基調 */
--neutral-cream: #F5F4F2;         /* 奶油白 - 主背景 */
--neutral-white: #FEFEFE;         /* 純白 - 卡片背景 */
--neutral-light: #E8E6E3;         /* 淺灰 - 分隔線 */
--neutral-medium: #B8B5B2;        /* 中灰 - 禁用狀態 */
--neutral-dark: #3A3A3A;          /* 深色 - 主文字 */

/* 功能色調 - 莫蘭迪調和 */
--success: #7A9B7E;               /* 莫蘭迪綠 */
--warning: #C4A661;               /* 莫蘭迪黃 */
--error: #B07A7A;                 /* 莫蘭迪紅 */
--info: #7A93B0;                  /* 莫蘭迪藍 */
```

### 漸層設計系統
```css
/* 主要漸層 - 頁面背景 */
.gradient-main {
  background: linear-gradient(135deg, #8B7CC8 0%, #A8A5A0 100%);
}

/* 次要漸層 - 卡片背景 */
.gradient-card {
  background: linear-gradient(145deg, #FEFEFE 0%, #F5F4F2 100%);
}

/* 按鈕漸層 - 互動元素 */
.gradient-button {
  background: linear-gradient(45deg, #8B7CC8 0%, #6B5D8C 100%);
}

/* 柔和漸層 - 裝飾元素 */
.gradient-soft {
  background: linear-gradient(180deg, rgba(139,124,200,0.1) 0%, rgba(168,165,160,0.05) 100%);
}
```

## 字體與排版系統

### 字體階層
```css
/* 韓式友好字體 */
font-family: 'Noto Sans CJK TC', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;

/* 標題系統 */
.text-hero {          /* 主標題 */
  font-size: 2.5rem;  /* 40px */
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.text-h1 {            /* 一級標題 */
  font-size: 2rem;    /* 32px */
  font-weight: 600;
  line-height: 1.3;
}

.text-h2 {            /* 二級標題 */
  font-size: 1.5rem;  /* 24px */
  font-weight: 600;
  line-height: 1.4;
}

.text-h3 {            /* 三級標題 */
  font-size: 1.25rem; /* 20px */
  font-weight: 500;
  line-height: 1.5;
}

/* 內文系統 */
.text-body {          /* 主要內文 */
  font-size: 1rem;    /* 16px */
  font-weight: 400;
  line-height: 1.6;
}

.text-small {         /* 次要文字 */
  font-size: 0.875rem; /* 14px */
  font-weight: 400;
  line-height: 1.5;
}

.text-caption {       /* 說明文字 */
  font-size: 0.75rem;  /* 12px */
  font-weight: 400;
  line-height: 1.4;
}
```

### 響應式字體
```css
/* 移動端字體縮放 */
@media (max-width: 768px) {
  .text-hero { font-size: 2rem; }     /* 32px */
  .text-h1 { font-size: 1.75rem; }   /* 28px */
  .text-h2 { font-size: 1.375rem; }  /* 22px */
  .text-h3 { font-size: 1.125rem; }  /* 18px */
  .text-body { font-size: 0.875rem; } /* 14px */
}
```

## 間距與布局系統

### 間距標準 (基於 8px 網格)
```css
/* Tailwind CSS 間距對照 */
.space-xs { gap: 0.25rem; }  /* 4px */
.space-sm { gap: 0.5rem; }   /* 8px */
.space-md { gap: 1rem; }     /* 16px */
.space-lg { gap: 1.5rem; }   /* 24px */
.space-xl { gap: 2rem; }     /* 32px */
.space-2xl { gap: 3rem; }    /* 48px */
.space-3xl { gap: 4rem; }    /* 64px */
```

### 布局網格
```css
/* 響應式容器 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) { .container { padding: 0 1.5rem; } }
@media (min-width: 1024px) { .container { padding: 0 2rem; } }

/* 網格系統 */
.grid-responsive {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .grid-responsive { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .grid-responsive { grid-template-columns: repeat(3, 1fr); }
}
```

## 組件設計規範

### 按鈕系統
```css
/* 主要按鈕 */
.btn-primary {
  background: linear-gradient(45deg, #8B7CC8 0%, #6B5D8C 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(139, 124, 200, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 124, 200, 0.4);
}

/* 次要按鈕 */
.btn-secondary {
  background: transparent;
  color: #8B7CC8;
  border: 2px solid #8B7CC8;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #8B7CC8;
  color: white;
}

/* 按鈕尺寸變化 */
.btn-sm { padding: 0.5rem 1rem; font-size: 0.875rem; }
.btn-lg { padding: 1rem 2rem; font-size: 1.125rem; }
```

### 卡片系統
```css
/* 基礎卡片 */
.card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(139, 124, 200, 0.1);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* 產品卡片 */
.product-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}
```

### 表單元素
```css
/* 輸入框 */
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #E9ECEF;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.input:focus {
  outline: none;
  border-color: #8B7CC8;
  box-shadow: 0 0 0 3px rgba(139, 124, 200, 0.1);
}

/* 複選框 - 莫蘭迪風格 */
.checkbox {
  appearance: none;
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #E8E6E3;
  border-radius: 0.25rem;
  background: white;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox:checked {
  background: linear-gradient(45deg, #8B7CC8 0%, #6B5D8C 100%);
  border-color: #8B7CC8;
}

.checkbox:checked::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
}
```

## 用戶體驗流程設計

### 首頁載入體驗
```
載入順序:
1. 品牌 Logo 淡入 (0.3s)
2. 主標題動畫出現 (0.5s)
3. 表單元素依序出現 (0.7s)
4. 背景漸層動畫 (持續)
```

### 照片上傳體驗
```css
/* 拖拽上傳區域 */
.upload-zone {
  border: 2px dashed #AEA4D6;
  border-radius: 1rem;
  padding: 3rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, 
    rgba(139, 124, 200, 0.05) 0%, 
    rgba(168, 165, 160, 0.05) 100%);
  transition: all 0.3s ease;
}

.upload-zone:hover {
  border-color: #8B7CC8;
  background: linear-gradient(135deg, 
    rgba(139, 124, 200, 0.1) 0%, 
    rgba(168, 165, 160, 0.1) 100%);
}

.upload-zone.dragover {
  border-color: #8B7CC8;
  transform: scale(1.02);
  box-shadow: 0 8px 30px rgba(139, 124, 200, 0.2);
}
```

### 虛擬試穿互動體驗
```
操作流程:
1. 服裝縮圖 hover 效果預覽
2. 點擊後即時載入到畫布
3. 拖拽調整位置 (觸覺反饋)
4. 縮放手勢支援 (移動端)
5. 儲存動畫確認
```

## 微互動設計

### 載入動畫
```css
/* 莫蘭迪愛心載入動畫 */
.loading-heart {
  width: 40px;
  height: 40px;
  position: relative;
  animation: heartbeat 1.2s infinite;
}

.loading-heart::before,
.loading-heart::after {
  content: "";
  width: 20px;
  height: 32px;
  position: absolute;
  background: linear-gradient(45deg, #8B7CC8 0%, #6B5D8C 100%);
  border-radius: 20px 20px 0 0;
  transform: rotate(-45deg);
  transform-origin: 0 100%;
}

.loading-heart::after {
  left: 0;
  transform: rotate(45deg);
  transform-origin: 100% 100%;
}

@keyframes heartbeat {
  0%, 40%, 80%, 100% { transform: scale(1); }
  20%, 60% { transform: scale(1.1); }
}
```

### 按鈕點擊效果
```css
.btn-click-effect {
  position: relative;
  overflow: hidden;
}

.btn-click-effect::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-click-effect:active::after {
  width: 300px;
  height: 300px;
}
```

### 成功狀態動畫
```css
/* 打勾動畫 */
.success-check {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #7A9B7E;
  position: relative;
  animation: success-pop 0.6s ease;
}

.success-check::after {
  content: "";
  position: absolute;
  top: 18px;
  left: 22px;
  width: 16px;
  height: 8px;
  border: 3px solid white;
  border-top: none;
  border-right: none;
  transform: rotate(-45deg);
  animation: check-draw 0.4s ease 0.2s forwards;
  opacity: 0;
}

@keyframes success-pop {
  0% { transform: scale(0); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes check-draw {
  to { opacity: 1; }
}
```

## 響應式設計原則

### 斷點系統
```css
/* Mobile First 設計 */
/* Default: Mobile (375px+) */

/* Small Mobile */
@media (min-width: 480px) { /* 小手機橫向 */ }

/* Tablet */
@media (min-width: 768px) { /* 平板直向 */ }

/* Small Desktop */
@media (min-width: 1024px) { /* 小桌面 */ }

/* Large Desktop */
@media (min-width: 1280px) { /* 大桌面 */ }

/* Extra Large */
@media (min-width: 1536px) { /* 超大螢幕 */ }
```

### 移動端優化
```css
/* 觸控友好設計 */
.touch-target {
  min-height: 44px;  /* iOS 最小觸控區域 */
  min-width: 44px;
}

/* 手勢支援 */
.swipeable {
  touch-action: pan-x pan-y;
  user-select: none;
}

/* 安全區域適配 */
.safe-area {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

## 無障礙設計 (Accessibility)

### 色彩對比度
```css
/* WCAG AA 標準對比度 */
.text-primary { 
  color: #212529;    /* 對比度: 16.9:1 */
  background: white; 
}

.text-secondary { 
  color: #495057;    /* 對比度: 9.8:1 */
  background: white; 
}

/* 色盲友善設計 */
.color-blind-safe {
  /* 避免單純依賴顏色傳達資訊 */
  /* 使用圖標、形狀、文字輔助 */
}
```

### 鍵盤導航
```css
/* Focus 狀態設計 */
.focusable:focus {
  outline: 2px solid #FF6B9D;
  outline-offset: 2px;
}

/* Skip Link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #212529;
  color: white;
  padding: 8px;
  text-decoration: none;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
}
```

### 螢幕閱讀器支援
```html
<!-- 語意化 HTML 結構 -->
<main role="main" aria-label="虛擬試穿主要內容">
  <section aria-label="風格偏好選擇">
    <h2>選擇你的風格偏好</h2>
    <!-- 內容 -->
  </section>
</main>

<!-- ARIA 標籤 -->
<button aria-label="上傳全身照片" aria-describedby="upload-help">
  上傳照片
</button>
<div id="upload-help">建議上傳正面、光線良好的全身照片</div>
```

## 效能優化設計

### 圖片優化策略
```css
/* 響應式圖片 */
.responsive-img {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 0.75rem;
}

/* 漸進式載入 */
.img-progressive {
  background: linear-gradient(90deg, #f0f0f0 25%, transparent 37%, #f0f0f0 63%);
  background-size: 400% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
```

### CSS 動畫效能
```css
/* GPU 加速動畫 */
.hardware-accelerated {
  transform: translateZ(0);  /* 觸發硬體加速 */
  will-change: transform;    /* 優化動畫效能 */
}

/* 高效能動畫屬性 */
.efficient-animation {
  /* 只使用 transform 和 opacity */
  transition: transform 0.3s ease, opacity 0.3s ease;
}
```

## 設計交付清單

### 設計稿交付
- [ ] **首頁設計** (Desktop 1920px, Mobile 375px)
- [ ] **試穿頁設計** (包含互動狀態)
- [ ] **商品頁設計** (網格布局變化)
- [ ] **結帳頁設計** (多步驟流程)

### 組件庫交付
- [ ] **按鈕組件** (所有尺寸和狀態)
- [ ] **表單組件** (輸入框、複選框、下拉選單)
- [ ] **卡片組件** (產品卡片、資訊卡片)
- [ ] **導航組件** (頂部導航、側邊選單)

### 動畫規格
- [ ] **載入動畫** (心形載入、進度條)
- [ ] **轉場動畫** (頁面切換、模態框)
- [ ] **互動動畫** (按鈕點擊、hover 效果)
- [ ] **成功動畫** (操作完成、提交成功)

### 響應式規格
- [ ] **移動端適配** (375px - 767px)
- [ ] **平板端適配** (768px - 1023px)
- [ ] **桌面端優化** (1024px+)
- [ ] **極端尺寸處理** (320px, 1920px+)

## 品質檢查標準

### 視覺一致性
- [ ] 色彩使用符合設計系統
- [ ] 字體大小和權重一致
- [ ] 間距使用標準化數值
- [ ] 圓角和陰影統一風格

### 用戶體驗
- [ ] 操作流程直觀清晰
- [ ] 反饋訊息及時準確
- [ ] 載入狀態適當顯示
- [ ] 錯誤處理用戶友善

### 技術可行性
- [ ] 設計規格可程式化實現
- [ ] 動畫效能需求合理
- [ ] 響應式設計可適配
- [ ] 無障礙標準符合要求