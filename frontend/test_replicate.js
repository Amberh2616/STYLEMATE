// 測試 Replicate API 連接
const REPLICATE_API_TOKEN = 'r8_C8mbfc5JOlEDkhwWifA1yM9lkHBvrCP0TnC6t';

async function testReplicate() {
  try {
    console.log('🧪 測試 Replicate API 連接...');
    
    const response = await fetch('https://api.replicate.com/v1/models', {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      console.log('✅ Replicate API 連接成功!');
      const models = await response.json();
      console.log('📊 可用模型數量:', models.results?.length || 0);
    } else {
      console.log('❌ Replicate API 失敗:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('💥 測試錯誤:', error);
  }
}

testReplicate();