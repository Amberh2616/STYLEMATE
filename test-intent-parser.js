// 測試 Intent Parser - 完整導入模組
import * as intentParser from './frontend/lib/core/intentParser.ts';

const testQueries = [
  '我明天要去韓國首爾旅行5天，請推薦適合的穿搭',
  '去日本東京旅遊3天，需要什麼衣服',
  '下周要出差到台北，天氣會如何',
  '我要去巴黎旅行一周，請建議穿搭'
];

console.log('🧪 開始測試 Intent Parser...\n');

testQueries.forEach((query, index) => {
  console.log(`📝 測試 ${index + 1}: ${query}`);
  try {
    const result = intentParser.analyzeIntent({ text: query });
    console.log('✅ 結果:', JSON.stringify(result, null, 2));
    console.log('---\n');
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    console.log('---\n');
  }
});

console.log('🎯 Intent Parser 測試完成！');