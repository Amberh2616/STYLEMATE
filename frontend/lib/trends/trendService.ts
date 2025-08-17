import { fetchTrendDocs, TrendDoc } from "./webSearch";
import { normalizeTrends } from "./extractors";

export async function getTrendSummary(params: {
  season?: string;
  regions?: ("JP"|"KR"|"EU"|"US"|"TW")[];
  fashionWeek?: boolean;
}) {
  // 1) 拉來源（RSS/清單頁），可在上層加快取
  const docs: TrendDoc[] = await fetchTrendDocs({
    regions: params.regions,
    season: params.season,
    fashionWeek: params.fashionWeek,
  });

  // 2) 規則化對齊你的白名單
  const norm = normalizeTrends(docs);

  // 3) 統一輸出結構，與模型的 trend_summary JSON 對齊
  return {
    trend_season: params.season || inferSeasonFromNow(),
    region: (params.regions || []).join("/") || "不確定",
    ...norm,
  };
}

function inferSeasonFromNow() {
  const m = new Date().getMonth() + 1;
  return (m >= 9 || m <= 2) ? "秋冬" : "春夏";
}