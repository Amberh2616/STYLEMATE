#!/usr/bin/env node
/**
 * 測試 Gemini API 虛擬試穿功能
 */

// 測試用的 base64 圖片數據（簡單的純色圖片）
const testPersonImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
const testGarmentImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

async function testGeminiAPI() {
  console.log('🧪 測試 Gemini API 虛擬試穿功能');
  console.log('===========================================');
  
  try {
    console.log('📤 發送測試請求到 /api/tryon...');
    
    const response = await fetch('http://localhost:3002/api/tryon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personImageUrl: testPersonImage,
        garmentImageUrl: testGarmentImage
      })
    });
    
    console.log(`📬 收到回應，狀態碼: ${response.status}`);
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Gemini API 測試成功！');
      console.log('📋 回應結果:', JSON.stringify(result, null, 2));
      
      if (result.url) {
        console.log('🖼️  生成的圖片 URL:', result.url.substring(0, 100) + '...');
        console.log('📏 圖片數據長度:', result.url.length);
      }
    } else {
      console.log('❌ API 測試失敗');
      console.log('💥 錯誤詳情:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('🚨 測試過程發生錯誤:', error.message);
  }
}

// 執行測試
testGeminiAPI();