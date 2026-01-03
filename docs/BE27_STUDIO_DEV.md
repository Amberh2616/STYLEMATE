# BE 27 穿搭工作室 - 開發進度

> 最後更新：2026-01-03

## 專案概述

BE 27 穿搭工作室是一個白板式的穿搭搭配工具，讓用戶可以自由拖拽商品到畫布上進行搭配，並建立 LOOK 組合。

**頁面路徑**: `/studio`
**主要檔案**: `/frontend/app/studio/page.tsx`

---

## 功能狀態

### ✅ 已完成功能

| 功能 | 說明 | 完成日期 |
|------|------|----------|
| 白板畫布 | 點狀背景、自由拖拽區域 | 2026-01-03 |
| 商品列表 | 左側面板、分類篩選、搜尋 | 2026-01-03 |
| 拖拽商品 | 點擊商品加入白板、自由移動 | 2026-01-03 |
| 選取工具 | 單選、Ctrl+點擊多選 | 2026-01-03 |
| 框選工具 | 矩形框選多個商品 | 2026-01-03 |
| 建立 LOOK | 選中商品後建立穿搭組合 | 2026-01-03 |
| 放大/縮小 | 調整選中商品大小 | 2026-01-03 |
| 複製 | 複製選中的商品 | 2026-01-03 |
| 截圖 | html2canvas 下載白板畫面 | 2026-01-03 |
| 刪除 | 刪除選中的商品 | 2026-01-03 |
| LOOK 面板 | 右側面板顯示已建立的 LOOK | 2026-01-03 |
| 商品詳情 Modal | 點擊 info 查看商品詳細資訊 | 2026-01-03 |
| 工具列常駐 | 工具列始終顯示，未選中時禁用 | 2026-01-03 |

### ⏳ 開發中 / TODO

| 優先級 | 功能 | 說明 | 狀態 |
|--------|------|------|------|
| P1 | 繪圖功能 | 畫筆標註工具 | TODO |
| P2 | 試穿整合 | LOOK「試穿這套」按鈕連接試穿 API | TODO |
| P2 | 購物車整合 | 「加入購物車」功能 | TODO |
| P3 | LOOK 編輯 | 重命名、從 LOOK 移回白板 | TODO |
| P3 | 儲存/載入 | 保存白板狀態到 localStorage | TODO |

### ❌ 已移除功能

| 功能 | 原因 |
|------|------|
| 翻轉 | 暫不需要 |
| 置頂/置底 | 暫不需要 |
| 對齊（左/中/右） | 暫不需要 |

---

## 技術架構

### 狀態管理
- React useState 管理白板狀態
- 未來可考慮遷移到 Zustand

### 核心 Interface

```typescript
interface CanvasItem {
  id: string
  product: DjangoProduct
  x: number
  y: number
  scale: number
  zIndex: number
  selected: boolean
}

interface Look {
  id: string
  name: string
  items: CanvasItem[]
  createdAt: Date
}
```

### 依賴套件
- `html2canvas`: 截圖功能
- `@heroicons/react`: 圖標
- Django API: 商品數據來源

---

## API 依賴

| API | 用途 | 狀態 |
|-----|------|------|
| `GET /api/v1/products/` | 取得商品列表 | ✅ 運作中 |
| `GET /api/v1/products/by_category/` | 分類篩選 | ✅ 運作中 |
| `POST /api/tryon` | 虛擬試穿 | 待整合 |

---

## 開發備註

1. **Django 後端必須運行** - 商品圖片和數據來自 `localhost:8000`
2. **去背圖片優先** - 使用 `image_nobg` 欄位，無則 fallback 到 `image`
3. **工具列設計** - 未選中商品時按鈕禁用但可見，提升 UX
