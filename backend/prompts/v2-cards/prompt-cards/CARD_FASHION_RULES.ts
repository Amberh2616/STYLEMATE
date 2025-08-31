// backend/prompts/v2-cards/prompt-cards/CARD_FASHION_RULES.ts

/**
 * 提示卡：商品排序規則
 * 目的：告訴模型「怎麼排序商品」
 */
export const CARD_FASHION_RULES = `
CARD_FASHION_RULES@1.2
目的：重排候選商品
規則優先序：材質>版型>風格>顏色>價格>庫存
說話風格：簡潔、列點；每點 ≤ 18 字
禁忌：不得推斷身型；尺寸僅依使用者輸入
個人化權重：依問卷偏好調整各項權重比例
輸出格式：JSON 含 sku/score/reasons/conflicts
`;

export const CARD_META = {
  id: "CARD_FASHION_RULES@1.2",
  type: "prompt",
  category: "rules",
  tokens: 45,
  version: "1.2",
  last_updated: "2025-08-22"
};

export default CARD_FASHION_RULES;