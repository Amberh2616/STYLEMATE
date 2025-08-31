/**
 * 🧪 熱修驗證腳本：測試天氣推薦6件商品功能
 */

async function testWeatherRecommendations() {
  const baseUrl = 'http://localhost:3002'
  
  console.log('🧪 開始測試熱修效果...\n')
  
  const testCases = [
    {
      name: '日本旅行測試',
      message: '我要去日本旅行，推薦一些適合的衣服',
      expectedMode: 'travel_plan'
    },
    {
      name: '英國旅行測試', 
      message: '我計劃去英國玩一週，需要什麼衣服?',
      expectedMode: 'travel_plan'
    },
    {
      name: '韓國春天測試',
      message: '韓國春天旅遊穿什麼?',
      expectedMode: 'travel_plan'
    }
  ]
  
  for (const testCase of testCases) {
    console.log(`🎯 ${testCase.name}`)
    console.log(`📝 查詢: "${testCase.message}"`)
    
    try {
      const response = await fetch(`${baseUrl}/api/chat/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testCase.message,
          conversationHistory: []
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // 🚀 新契約：檢查 items 而不是 recommendedProducts
        const itemsCount = result.items?.length || 0
        const recommendedCount = result.recommendedProducts?.length || 0
        
        console.log(`✅ 成功 - 商品項目數量: ${itemsCount}, 推薦ID數量: ${recommendedCount}`)
        console.log(`🏷️  推薦來源: ${result.from || 'unknown'}, ID類型: ${result.idType || 'unknown'}`)
        console.log(`📦  商品項目: ${result.items?.map(item => item.slug || item.id).join(', ') || 'none'}`)
        
        // 驗證是否達到預期 - 以 items 為準
        if (itemsCount >= 3) {
          console.log(`🎉 通過！回傳了 ${itemsCount} 個完整商品項目 (≥3件)`)
        } else {
          console.log(`❌ 失敗！只回傳了 ${itemsCount} 個商品項目 (<3件)`)
        }
      } else {
        console.log(`❌ API錯誤: ${result.response || 'Unknown error'}`)
      }
      
    } catch (error) {
      console.log(`❌ 請求失敗: ${error.message}`)
    }
    
    console.log('─'.repeat(50))
  }
  
  console.log('🧪 測試完成')
}

// 運行測試
testWeatherRecommendations().catch(console.error)