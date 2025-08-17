// 簡單測試趨勢管線 RSS 抓取
const Parser = require('rss-parser');
const fetch = require('node-fetch');

const RSS_SOURCES = [
  { source: "Hypebeast", url: "https://hypebeast.com/rss" },
  { source: "Highsnobiety", url: "https://www.highsnobiety.com/feed/" },
  { source: "Fashionista", url: "https://fashionista.com/.rss/full/" }
];

async function testRSSFetch() {
  console.log('🔍 測試 RSS 來源抓取...\n');
  
  const parser = new Parser();
  let totalItems = 0;
  let successSources = 0;
  
  for (const src of RSS_SOURCES) {
    try {
      console.log(`📡 測試 ${src.source}...`);
      
      const feed = await parser.parseURL(src.url);
      const items = feed.items || [];
      
      console.log(`✅ ${src.source}: 成功抓取 ${items.length} 篇文章`);
      
      if (items.length > 0) {
        totalItems += items.length;
        successSources++;
        
        // 顯示前2篇文章
        console.log('   前2篇文章:');
        items.slice(0, 2).forEach((item, i) => {
          console.log(`   ${i+1}. ${item.title || '無標題'}`);
          console.log(`      日期: ${item.pubDate || '未知'}`);
          console.log(`      連結: ${item.link || '無連結'}`);
          console.log('');
        });
      }
      
    } catch (error) {
      console.log(`❌ ${src.source}: 失敗 - ${error.message}`);
    }
    
    console.log(''); // 空行分隔
  }
  
  console.log('📊 總結:');
  console.log(`   成功來源: ${successSources}/${RSS_SOURCES.length}`);
  console.log(`   總文章數: ${totalItems}`);
  
  if (successSources === 0) {
    console.log('\n⚠️ 所有 RSS 來源都失敗了，可能原因:');
    console.log('   - 網路連接問題');
    console.log('   - RSS 來源 URL 已變更');
    console.log('   - 被防火牆阻擋');
    console.log('   - User-Agent 被拒絕');
  } else if (successSources < RSS_SOURCES.length) {
    console.log('\n⚠️ 部分 RSS 來源失敗，但系統仍可運作');
  } else {
    console.log('\n✅ 所有 RSS 來源正常，趨勢管線可以運作！');
  }
}

// 執行測試
testRSSFetch().catch(console.error);