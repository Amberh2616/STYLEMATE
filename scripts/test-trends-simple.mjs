// 簡單測試 RSS 抓取
import Parser from 'rss-parser';

async function testSimpleRSS() {
  console.log("🔍 測試基本 RSS 抓取功能...");
  
  const parser = new Parser({
    timeout: 5000,
    headers: {
      'User-Agent': 'StylemateBot/1.0 (+https://stylemate.app/bot)'
    }
  });

  const sources = [
    { name: "Fashionista", url: "https://fashionista.com/.rss/full/" },
    { name: "Highsnobiety", url: "https://www.highsnobiety.com/feed/" },
  ];

  for (const source of sources) {
    try {
      console.log(`\n📡 抓取 ${source.name}...`);
      const feed = await parser.parseURL(source.url);
      console.log(`✅ 成功！標題：${feed.title}`);
      console.log(`📊 文章數量：${feed.items?.length || 0}`);
      
      if (feed.items && feed.items.length > 0) {
        console.log("🔥 最新 3 篇文章：");
        feed.items.slice(0, 3).forEach((item, i) => {
          console.log(`  ${i+1}. ${item.title}`);
          console.log(`     發布：${item.pubDate || '未知'}`);
        });
      }
    } catch (error) {
      console.error(`❌ ${source.name} 抓取失敗:`, error.message);
    }
  }
}

testSimpleRSS();