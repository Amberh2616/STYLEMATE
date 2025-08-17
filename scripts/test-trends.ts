// 測試趨勢管線是否能正常抓取資料
import { fetchTrendDocs } from '../frontend/lib/trends/webSearch.js';
import { normalizeTrends } from '../frontend/lib/trends/extractors.js';
import { getTrendSummary } from '../frontend/lib/trends/trendService.js';

async function testTrendsSystem() {
  console.log('🔍 測試趨勢管線系統...\n');

  try {
    // 1) 測試 WebSearch - 抓取原始趨勢文檔
    console.log('1️⃣ 測試 WebSearch 抓取...');
    const trendDocs = await fetchTrendDocs({ 
      regions: ['KR', 'JP'], 
      season: '春夏',
      fashionWeek: false 
    });
    
    console.log(`✅ 抓取到 ${trendDocs.length} 個趨勢文檔`);
    
    if (trendDocs.length > 0) {
      console.log('📄 前3個文檔預覽:');
      trendDocs.slice(0, 3).forEach((doc, i) => {
        console.log(`  ${i+1}. [${doc.source}] ${doc.title}`);
        console.log(`     URL: ${doc.url}`);
        console.log(`     片段: ${doc.snippet?.slice(0, 100)}...`);
        console.log(`     地區: ${doc.region_hint || '未知'}`);
        console.log(`     季節: ${doc.season_hint || '未知'}`);
        console.log(`     類型: ${doc.type || '未知'}`);
        console.log('');
      });
    } else {
      console.log('⚠️ 未抓取到任何趨勢文檔，可能的原因:');
      console.log('   - RSS 來源無法訪問');
      console.log('   - 關鍵字過濾太嚴格');
      console.log('   - 網路連接問題');
    }

    // 2) 測試 Extractors - 標準化處理
    console.log('\n2️⃣ 測試 Extractors 標準化...');
    const normalized = normalizeTrends(trendDocs);
    
    console.log('✅ 標準化結果:');
    console.log(`   關鍵風格: ${normalized.key_styles.join('、') || '無'}`);
    console.log(`   關鍵顏色: ${normalized.key_colors.join('、') || '無'}`);
    console.log(`   熱門單品: ${normalized.popular_items.join('、') || '無'}`);
    console.log(`   材質紋理: ${normalized.fabric_textures.join('、') || '無'}`);
    console.log(`   來源: ${normalized.sources.join('、') || '無'}`);

    // 3) 測試 TrendService - 統一入口
    console.log('\n3️⃣ 測試 TrendService 統一入口...');
    const trendSummary = await getTrendSummary({
      season: '春夏',
      regions: ['KR', 'JP'],
      fashionWeek: false
    });
    
    console.log('✅ 最終趨勢摘要:');
    console.log(`   趨勢季節: ${trendSummary.trend_season}`);
    console.log(`   地區: ${trendSummary.region}`);
    console.log(`   關鍵風格 (${trendSummary.key_styles.length}): ${trendSummary.key_styles.join('、')}`);
    console.log(`   關鍵顏色 (${trendSummary.key_colors.length}): ${trendSummary.key_colors.join('、')}`);
    console.log(`   熱門單品 (${trendSummary.popular_items.length}): ${trendSummary.popular_items.join('、')}`);
    console.log(`   材質紋理 (${trendSummary.fabric_textures.length}): ${trendSummary.fabric_textures.join('、')}`);
    console.log(`   來源數量: ${trendSummary.sources.length}`);

    // 4) 評估數據品質
    console.log('\n📊 數據品質評估:');
    const hasStyles = trendSummary.key_styles.length > 0;
    const hasColors = trendSummary.key_colors.length > 0;
    const hasItems = trendSummary.popular_items.length > 0;
    const hasSources = trendSummary.sources.length > 0;
    
    console.log(`   風格數據: ${hasStyles ? '✅' : '❌'} ${trendSummary.key_styles.length} 個`);
    console.log(`   顏色數據: ${hasColors ? '✅' : '❌'} ${trendSummary.key_colors.length} 個`);
    console.log(`   單品數據: ${hasItems ? '✅' : '❌'} ${trendSummary.popular_items.length} 個`);
    console.log(`   來源數據: ${hasSources ? '✅' : '❌'} ${trendSummary.sources.length} 個`);
    
    const overallQuality = [hasStyles, hasColors, hasItems, hasSources].filter(Boolean).length;
    console.log(`\n🎯 整體品質: ${overallQuality}/4 ${overallQuality >= 3 ? '✅ 良好' : overallQuality >= 2 ? '⚠️ 尚可' : '❌ 需改進'}`);
    
    if (overallQuality < 2) {
      console.log('\n🔧 改進建議:');
      console.log('   1. 檢查 RSS 來源是否可訪問');
      console.log('   2. 放寬關鍵字過濾條件');
      console.log('   3. 增加更多 RSS 來源');
      console.log('   4. 檢查網路連接');
    }

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
    console.error('錯誤詳情:', (error as Error).message);
    
    if ((error as Error).message.includes('fetch')) {
      console.log('\n💡 可能是網路連接問題，請檢查:');
      console.log('   - 網路連接是否正常');
      console.log('   - RSS 來源是否可訪問');
      console.log('   - 防火牆設定');
    }
  }
}

// 執行測試
if (require.main === module) {
  testTrendsSystem().catch(console.error);
}

export { testTrendsSystem };