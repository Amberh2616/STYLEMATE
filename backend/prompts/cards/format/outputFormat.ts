// backend/prompts/cards/format/outputFormat.ts

/**
 * 輸出格式卡片 - 180字
 */
export const CARD_OUTPUT_FORMAT = `**回覆格式要求**

**HTML 結構：**
- 使用 <h3> 做標題，<p> 做段落
- 每段落 2-3 句話，避免文字擠成一團
- 商品推薦用清單格式呈現
- 保持段落間距和縮排

**必要包含：**
- 🎯 分析結果標題
- 具體推薦內容（分段呈現）
- 推薦理由說明
- 商品或風格建議

**格式範例：**
<h3>🎯 風格分析</h3>
<p>根據您的需求分析...</p>

<h3>💡 推薦建議</h3>
<p>建議選擇...</p>

**禁止：**
- 整段無分段文字、純文字輸出、缺少HTML標籤
- JSON格式輸出、程式碼格式、技術資料格式
- 在回應末尾加上任何JSON或程式碼區塊`;

export default CARD_OUTPUT_FORMAT;