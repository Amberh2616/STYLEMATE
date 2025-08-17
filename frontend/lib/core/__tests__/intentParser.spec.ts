// frontend/lib/core/__tests__/intentParser.spec.ts
import { analyzeIntent } from "../intentParser";

describe("Intent Parser", () => {
  test("旅行：含地點與天數 → travel_plan + needs_weather", () => {
    const input = { text: "我要去 Seoul 玩 5天 幫我查天氣 要穿什麼" };
    const out = analyzeIntent(input);
    expect(out.mode).toBe("travel_plan");
    expect(out.needs_weather).toBe(true);
    expect(out.destinations?.[0]).toContain("Seoul");
    expect(out.date_range).toBeDefined();
  });

  test("趨勢：今年日韓流行 → trend_summary", () => {
    const out = analyzeIntent({ text: "今年日韓流行趨勢有哪些？時裝周重點？" });
    expect(out.mode).toBe("trend_summary");
    expect(out.needs_weather).toBeFalsy();
  });

  test("正式場合：海邊婚禮 → analyze_and_recommend + needs_rag", () => {
    const out = analyzeIntent({ text: "海邊婚禮要穿什麼？" });
    expect(out.mode).toBe("analyze_and_recommend");
    expect(out.needs_rag).toBe(true);
    expect(out.occasions).toContain("正式");
  });

  test("重排關鍵字 → rerank", () => {
    const out = analyzeIntent({ text: "這幾件幫我重排 top 5" });
    expect(out.mode).toBe("rerank");
  });
});