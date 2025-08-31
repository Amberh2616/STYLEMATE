// test-rerank.js - 測試個人化 RERANK 功能

// 模擬導入（實際需要正確的路徑）
// const { buildOptimizedPrompt } = require('./backend/prompts/builder/promptBuilderV2.ts');

// 模擬用戶偏好資料
const testUserPreferences = {
  styleProfile: "甜美派",
  colorProfile: "亮色系愛好者", 
  occasionProfile: "約會甜心型",
  shoppingProfile: "時尚潮人"
};

// 模擬商品資料
const testFashionItems = [
  {
    sku: "A001", 
    name: "碎花洋裝", 
    style: "甜美可愛", 
    color: "粉色系",
    fit: "A字版型",
    material: "雪紡"
  },
  {
    sku: "B002", 
    name: "西裝外套", 
    style: "正式商務", 
    color: "黑色",
    fit: "修身版型", 
    material: "羊毛混紡"
  },
  {
    sku: "C003",
    name: "韓系毛衣",
    style: "韓系時尚",
    color: "米白色",
    fit: "寬鬆版型",
    material: "針織棉"
  },
  {
    sku: "D004",
    name: "牛仔外套",
    style: "休閒街頭",
    color: "淺藍色", 
    fit: "標準版型",
    material: "純棉牛仔"
  }
];

// 模擬 Intent 分析結果
const testIntent = { 
  mode: 'rerank',
  confidence: 0.9,
  needs_weather: false
};

console.log('=== 個人化 RERANK 測試 ===\n');

console.log('📋 測試用戶偏好:');
console.log(JSON.stringify(testUserPreferences, null, 2));

console.log('\n🛍️ 測試商品列表:');
testFashionItems.forEach(item => {
  console.log(`- ${item.sku}: ${item.name} (${item.style}, ${item.color}, ${item.fit})`);
});

console.log('\n🎯 期望結果分析:');
console.log('根據「甜美派 + 亮色系愛好者 + 約會甜心型 + 時尚潮人」偏好:');
console.log('- 權重調整: 風格匹配 ↑50%, 顏色搭配 ↑30%, 版型適配 ↓15%');
console.log('- 預期排序: A001碎花洋裝 > C003韓系毛衣 > D004牛仔外套 > B002西裝外套');
console.log('- 理由: 甜美風格+亮色系+約會場合 最符合用戶偏好');

console.log('\n🧪 要執行實際測試，請:');
console.log('1. 啟動服務: npm run search && cd frontend && npm run dev');
console.log('2. 填寫問卷: http://localhost:3002/member');
console.log('3. 在聊天頁面輸入: "重新排序這些商品" 或 "幫我重排商品"');
console.log('4. 檢查回應是否按個人偏好重新排序');

console.log('\n🔍 除錯檢查點:');
console.log('- Intent Parser 是否識別為 rerank 模式');
console.log('- PromptBuilder 是否載入 RERANK 卡片'); 
console.log('- 用戶偏好資料是否正確傳遞');
console.log('- AI 回應是否包含個人化權重說明');

// 模擬無偏好用戶對比測試
console.log('\n⚖️ 對比測試建議:');
console.log('測試兩種情況:');
console.log('1. 有問卷偏好: 預期個人化排序');
console.log('2. 無問卷偏好: 使用基準權重 (40%/30%/20%/10%)');