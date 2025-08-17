// 測試真實 RSS 抓取功能
import { fetchTrendDocs } from "../frontend/lib/trends/webSearch";
import { normalizeTrends } from "../frontend/lib/trends/extractors";

async function testLiveTrendsFetch() {
  console.log("🔍 開始測試真實 RSS 抓取功能...");
  
  try {
    // 測試1：一般流行趨勢
    console.log("\n📊 測試1：抓取一般流行趨勢");
    const generalTrends = await fetchTrendDocs({
      regions: ["US", "EU"],
      fashionWeek: false
    });
    console.log(`✅ 抓取到 ${generalTrends.length} 篇文章`);
    
    if (generalTrends.length > 0) {
      console.log("📝 前3篇標題：");
      generalTrends.slice(0, 3).forEach((doc, i) => {
        console.log(`  ${i+1}. [${doc.source}] ${doc.title}`);
        console.log(`     ${doc.url}`);
        console.log(`     發布時間：${doc.published_at || '未知'}`);
      });
    }

    // 測試2：時裝周專題
    console.log("\n🏃‍♀️ 測試2：抓取時裝周資訊");
    const fashionWeekTrends = await fetchTrendDocs({
      fashionWeek: true
    });
    console.log(`✅ 抓取到 ${fashionWeekTrends.length} 篇時裝周文章`);

    // 測試3：標準化處理
    console.log("\n🔄 測試3：標準化處理");
    const normalized = normalizeTrends(generalTrends);
    console.log("📊 標準化結果：");
    console.log(`  關鍵風格：${normalized.key_styles.join(", ")}`);
    console.log(`  關鍵顏色：${normalized.key_colors.join(", ")}`);
    console.log(`  熱門單品：${normalized.popular_items.join(", ")}`);
    console.log(`  材質質感：${normalized.fabric_textures.join(", ")}`);
    console.log(`  來源媒體：${normalized.sources.join(", ")}`);

    // 測試4：來源統計
    console.log("\n📈 測試4：來源統計");
    const sourceStats = generalTrends.reduce((acc, doc) => {
      acc[doc.source] = (acc[doc.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(sourceStats).forEach(([source, count]) => {
      console.log(`  ${source}: ${count} 篇`);
    });

  } catch (error) {
    console.error("❌ 測試失敗：", error);
  }
}

testLiveTrendsFetch();