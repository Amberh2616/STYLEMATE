// 測試卡片選擇器功能
import { selectCards } from './backend/prompts/selector/cardSelector.ts';

// 模擬不同的 Intent 情境
const testIntents = [
  {
    name: "商品推薦測試",
    intent: {
      mode: 'analyze_and_recommend',
      needs_weather: false,
      confidence: 0.9
    },
    hasWeather: false,
    hasImage: false
  },
  {
    name: "重排序測試", 
    intent: {
      mode: 'rerank',
      needs_weather: false,
      confidence: 0.8
    },
    hasWeather: false,
    hasImage: false
  },
  {
    name: "天氣穿搭測試",
    intent: {
      mode: 'analyze_and_recommend',
      needs_weather: true,
      confidence: 0.9
    },
    hasWeather: true,
    hasImage: false
  }
];

console.log('🧪 開始測試卡片選擇器...\n');

testIntents.forEach((test, index) => {
  console.log(`📋 測試 ${index + 1}: ${test.name}`);
  console.log('Intent:', JSON.stringify(test.intent, null, 2));
  console.log('hasWeather:', test.hasWeather);
  console.log('hasImage:', test.hasImage);
  
  try {
    const result = selectCards(test.intent, test.hasWeather, test.hasImage);
    console.log('✅ 選中的卡片:', result.cardNames);
    console.log('📏 總長度:', result.totalLength);
    console.log('---\n');
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    console.log('---\n');
  }
});

console.log('🎯 測試完成！');