# STYLEMATE - 韓國服裝虛擬試穿平台

一個採用莫蘭迪美學風格的韓國服裝虛擬試穿平台，讓你在家就能體驗最新的 K-fashion 穿搭風格。

## 🌐 線上預覽

網站部署在 GitHub Pages：

**https://[你的GitHub用戶名].github.io/STYLEMATE/**

## ✨ 主要功能

- 🎨 **AI 智能推薦** - 根據用戶喜好推薦適合的韓式穿搭
- 👔 **2D 虛擬試穿** - 即時預覽穿搭效果
- 💝 **韓式風格庫** - 精選韓國時尚單品
- 📱 **響應式設計** - 完美支援桌面、平板、手機
- 🎭 **莫蘭迪美學** - 柔和優雅的視覺設計

## 🚀 快速開始

### 本地開發

```bash
# 克隆專案
git clone https://github.com/[你的用戶名]/STYLEMATE.git
cd STYLEMATE

# 安裝依賴
cd frontend
npm install

# 啟動開發伺服器
npm run dev
```

訪問 http://localhost:3000 查看網站

### 部署到 GitHub Pages

1. **Fork 這個專案到你的 GitHub 帳號**

2. **啟用 GitHub Pages**
   - 進入專案的 Settings → Pages
   - Source 選擇 "GitHub Actions"

3. **推送代碼觸發自動部署**
   ```bash
   git push origin main
   ```

4. **網站將自動部署到：**
   `https://[你的用戶名].github.io/STYLEMATE/`

## 📦 技術棧

- **前端框架**: Next.js 14 (App Router)
- **開發語言**: TypeScript
- **樣式系統**: Tailwind CSS + 莫蘭迪配色
- **圖標庫**: Heroicons
- **狀態管理**: Zustand (規劃中)
- **部署平台**: GitHub Pages

## 🎨 設計特色

### 莫蘭迪色系
- 主色調：柔和薰衣草紫 (#8B7CC8)
- 輔助色：暖調灰、奶油白
- 功能色：調和過的綠、黃、紅、藍

### 頁面結構
- **首頁** - 照片上傳 + 風格選擇
- **商品頁** - 篩選瀏覽 + 收藏功能  
- **試穿室** - 虛擬試穿 + 穿搭儲存

## 📱 響應式支援

- 📱 **手機端** (375px+) - 觸控優化
- 📟 **平板端** (768px+) - 混合式操作
- 💻 **桌面端** (1024px+) - 完整功能

## 🔧 開發指令

```bash
# 開發模式
npm run dev

# 建構生產版本
npm run build

# 靜態導出 (GitHub Pages)
npm run export

# 程式碼檢查
npm run lint

# TypeScript 類型檢查
npm run type-check
```

## 📄 授權

MIT License - 詳見 [LICENSE](LICENSE) 檔案

## 🙋‍♀️ 聯絡我們

如有任何問題或建議，歡迎：
- 開啟 [Issue](https://github.com/[你的用戶名]/STYLEMATE/issues)
- 提交 [Pull Request](https://github.com/[你的用戶名]/STYLEMATE/pulls)

---

**讓每個人都能輕鬆擁有韓式時尚風格** ✨