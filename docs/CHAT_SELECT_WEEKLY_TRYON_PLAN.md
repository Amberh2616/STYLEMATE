# STYLEMATE UI 改版計畫（Chat → 選品 → 一周穿搭 → 試穿）

## 背景與目標
- 將 Chat 頁改為白底、左右雙欄：左側聊天、右側產品圖片＋文字介紹，參考 daydream ai 的留白與簡潔，但不複製。
- 建立白底流程頁面：選品（上衣/下身各 5–6 件）、一周穿搭（7 套自動生成，可重抽/替換）、虛擬試穿（上傳個人照，串接 nano banana）。
- 清理現有亂碼文案、統一字體與間距，維持莫蘭迪紫作為點綴色，頁面背景皆為白色。

## 範圍與頁面
- Chat（白底雙欄）
  - 位置：`frontend/app/chat/page.tsx`
  - 左：聊天訊息流與輸入區；右：推薦商品卡（圖＋名稱＋品牌/價格），CTA「開始挑選」。
- Select（白底，多選）
  - 建新頁：`frontend/app/select/page.tsx`
  - 兩區或兩段式：上衣、下身，各自多選，限制各最多 6 件，顯示「已選 X/6」。
- Weekly（白底，一周穿搭）
  - 建新頁：`frontend/app/weekly/page.tsx`
  - 由已選清單自動產生 7 套（Top+Bottom），支援「重抽一天」「重抽全部」「手動替換」。
- Try-on（白底，試穿結果）
  - 既有頁：`frontend/app/tryon/page.tsx`
  - 顯示 nano banana 回傳的合成圖、下載/分享/加入購物車等行為。

## 數量規則
- 上衣最多 6 件、下身最多 6 件；不足時允許 3–6 件並提示。
- 一周穿搭保證 7 套；同件單品本週最多使用 2 次，如組合不足可最小限度重複並標註提醒。

## 兩個實作方案

### 方案 A（快速落地，2–3 天）
- 作法
  - 直接在現有頁面改版 UI 與流程；新增 Select/Weekly 頁。
  - 狀態用 URL/localStorage 傳遞（例：`/weekly?tops=...&bottoms=...`）。
- 時程
  - Day 1：Chat 白底雙欄與商品側欄、CTA 導流。
  - Day 2：Select 多選頁（各 6 上限）；Weekly 一周穿搭（生成/重抽）。
  - Day 3：試穿流程（上傳→API→結果頁）打通、文案亂碼清理與微調。
- 優缺點
  - 優點：上線快、改動集中。
  - 缺點：跨頁狀態與一致性較弱，後續擴充成本較高。

### 方案 B（可擴充與一致化，3–4 天）
- 作法
  - 建立通用白底頁殼與 UI 元件；跨頁狀態使用 Zustand 管理。
  - 新增 Select/Weekly 頁與更穩健的生成邏輯與錯誤/空狀態處理。
- 時程
  - Day 1：WhiteShell/Container/Button/Card 元件；Chat 白底雙欄。
  - Day 2：Zustand 選品狀態；Select（上限 6 計數、勾選狀態）。
  - Day 3：Weekly（生成/重抽/替換）；試穿串接與體驗優化；亂碼清理。
  - Day 4（緩衝）：相容度調整、可達性、微交互。
- 優缺點
  - 優點：一致性高、擴充性佳（未來好維護/迭代）。
  - 缺點：起步工時較方案 A 多 20–30%。

## 狀態管理與資料流
- 方案 A：URL/localStorage
  - `tops: string[]`、`bottoms: string[]` 透過查詢字串或 localStorage 在 Select→Weekly 間傳遞。
- 方案 B：Zustand stores（建議）
  - `frontend/store/selection.ts`：`tops/bottoms`、`max=6`、`add/remove/clear`。
  - `frontend/store/weekly.ts`：`days: Array<{ day, topId, bottomId, score }>`、`generate/shuffleDay/shuffleAll/replaceItem`。
- 共同資料守衛
  - `getPrimaryImage(product)`、`getSafeDisplayName(product)` 確保圖片與名稱安全顯示（目前 Chat 中已有雛形）。

## 一周穿搭生成（簡易相容度）
- 欄位參考：`color`、`pattern`、`occasion`、`styleTags`。
- 分數：
  - 場合相符 +2；色相/明度接近或互補 +1～+2；圖樣衝突 −1。
- 演算法：
  - 先生成 `tops × bottoms` 所有組合並排序；以貪婪法選 7 套。
  - 每件單品使用次數 ≤ 2；不足時允許最小重複並標註提醒。

## Nano Banana 虛擬試穿串接
- API 包裝端點（Next API Route）
  - 新增：`frontend/app/api/tryon/nano-banana/route.ts`（或於現有 `api/tryon` 下新增子路由）。
- 環境變數
  - `NANO_BANANA_API_URL`
  - `NANO_BANANA_API_KEY`
- 前端流程
  - Weekly 頁中選擇某一套 → 上傳個人照片（base64/URL）→ `POST /api/tryon/nano-banana`（含 topImage、bottomImage）→ 成功回傳後將結果存 `localStorage.tryonResult` → 導向 `frontend/app/tryon/page.tsx` 顯示。
- 失敗回退
  - 顯示錯誤提示並保留上傳紀錄；可提供本地 Mock 圖方便 Demo。

## 視覺與可及性
- 白底：`bg-white text-neutral-dark`；細邊框 `border-neutral-light`；輕陰影 `shadow-sm`；大量留白。
- 按鈕：主色（莫蘭迪紫系）作 CTA；Focus ring 清晰；Icon 與文字間距一致。
- 圖片：皆有 `alt`；卡片提供 Skeleton/Empty/Error 狀態。
- 亂碼清理：統一繁中；優先修正 `frontend/app/chat/page.tsx`, `frontend/app/layout.tsx`, `frontend/app/globals.css` 中文字。

## 驗收標準（片段）
- Chat 頁為白底雙欄；右側商品卡可加入「選品」並導流到 Select。
- Select 頁各自上限 6 件，超限阻擋並提示；顯示「已選 X/6」。
- Weekly 頁能產生 7 套，支援單天與全部重抽、手動替換；狀態可在頁間保留。
- 上傳個人照片後可完成一次 nano banana 試穿並在 Try-on 頁顯示結果。

## 風險與緩解
- 產品欄位不齊：在卡片層做欄位守衛與 fallback 圖/名稱。
- 外部試穿 API 不穩：加重試與錯誤提示、提供 Mock 圖。
- 商品數量不足 6：允許 3–6 件並調整演算法與 UI 提示。

## 待決事項
- 選擇實作方案（A 快速落地；B 可擴充一致化）。
- Weekly 生成規則偏好：「多樣性」或「搭配分數」權重。
- 是否加入暗色模式（預設不加）。

## 時程建議
- 方案 A：2–3 天；方案 B：3–4 天（含緩衝）。
- 建議先改 Chat → 再做 Select/Weekly → 最後打通試穿 API。

***
如同意其一方案，我將先提交 Chat 頁白底雙欄與導流，接著補上 Select/Weekly 與試穿串接，並同步清理亂碼文案。
