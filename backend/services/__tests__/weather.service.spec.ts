// backend/services/__tests__/weather.service.spec.ts
import { WeatherService, InMemoryCache } from "../weather.service";
import type { WeatherAdapter, WeatherByDay } from "../weather/weather.types";

class MockAdapter implements WeatherAdapter {
  constructor(private ok = true, private tag = "primary") {}
  async getForecast(city: string): Promise<WeatherByDay[]> {
    if (!this.ok) throw new Error(`${this.tag}_fail`);
    return [
      { date: "2025-09-20", city, temp: 27, condition: "多雲", uv: 6 },
      { date: "2025-09-21", city, temp: 28, condition: "陣雨", rain_prob: 60 }
    ];
  }
}

describe("WeatherService", () => {
  test("正常：命中 primary，寫入快取", async () => {
    const cache = new InMemoryCache();
    const svc = new WeatherService(new MockAdapter(true, "p"), undefined, cache, 60);
    const r1 = await svc.forecast("Seoul, KR", "2025-09-20", "2025-09-24");
    expect(r1.days.length).toBeGreaterThan(0);
    expect(r1.cache_hit).toBe(false);

    const r2 = await svc.forecast("Seoul, KR", "2025-09-20", "2025-09-24");
    expect(r2.cache_hit).toBe(true);
  });

  test("降級：primary 失敗 → fallback 成功", async () => {
    const svc = new WeatherService(new MockAdapter(false, "p"), new MockAdapter(true, "b"));
    const r = await svc.forecast("Tokyo, JP", "2025-09-20", "2025-09-22");
    expect(r.days.length).toBeGreaterThan(0);
    expect(r.warning).toBe("primary_failed");
  });

  test("雙失敗：回空陣列且標記 warning", async () => {
    const svc = new WeatherService(new MockAdapter(false), new MockAdapter(false));
    const r = await svc.forecast("Taipei, TW", "2025-09-20", "2025-09-22");
    expect(r.days.length).toBe(0);
    expect(r.warning).toBe("weather_unavailable");
  });

  test("AUTO_TODAY + +Nd 展開", async () => {
    const svc = new WeatherService(new MockAdapter(true));
    const r = await svc.forecast("Seoul, KR", "AUTO_TODAY", "+5d");
    expect(r.days.length).toBeGreaterThan(0);
  });
});