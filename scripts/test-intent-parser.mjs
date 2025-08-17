// 測試 Intent Parser 是否正確識別時裝周查詢
import { analyzeIntent } from '../frontend/lib/core/intentParser.js';

const testQueries = [
  "2025紐約服裝周潮流資訊",
  "2025紐約時裝周潮流資訊", 
  "fashion week trends",
  "巴黎時裝周2025",
  "今年流行趨勢",
  "去東京旅行3天"
];

console.log("🧠 測試 Intent Parser...\n");

testQueries.forEach((query, i) => {
  console.log(`${i + 1}. 查詢: "${query}"`);
  try {
    const result = analyzeIntent({ text: query });
    console.log(`   模式: ${result.mode}`);
    console.log(`   需要天氣: ${result.needs_weather}`);
    console.log(`   需要RAG: ${result.needs_rag}`);
    console.log("");
  } catch (error) {
    console.error(`   錯誤: ${error.message}`);
    console.log("");
  }
});