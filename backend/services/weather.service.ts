// backend/services/weather.service.ts
import type { WeatherAdapter, WeatherByDay } from "./weather/weather.types";

type CacheLike = {
  get(key: string): Promise<any> | any;
  set(key: string, val: any, ttlSec?: number): Promise<void> | void;
};

export class InMemoryCache implements CacheLike {
  private m = new Map<string, { v: any; exp?: number }>();
  async get(key: string) {
    const it = this.m.get(key);
    if (!it) return null;
    if (it.exp && it.exp < Date.now()) { this.m.delete(key); return null; }
    return it.v;
  }
  async set(key: string, v: any, ttlSec = 1800) {
    const exp = Date.now() + ttlSec * 1000;
    this.m.set(key, { v, exp });
  }
}

export class WeatherService {
  constructor(
    private primary: WeatherAdapter,
    private backup?: WeatherAdapter,
    private cache: CacheLike = new InMemoryCache(),
    private ttlSec = 1800
  ) {}

  // 支援 AUTO_TODAY / +Nd 語法簡易展開（強烈建議在上層就已換算）
  private normalizeRange(start?: string, end?: string) {
    let s = start, e = end;
    if (start === "AUTO_TODAY") {
      const today = new Date().toISOString().slice(0,10);
      s = today;
      if (end?.startsWith("+")) {
        const d = parseInt(end.replace(/\D/g, ""), 10) || 5;
        const dt = new Date(today); dt.setDate(dt.getDate() + d - 1);
        e = dt.toISOString().slice(0,10);
      }
    }
    return { start: s, end: e };
  }

  async forecast(city: string, start?: string, end?: string):
    Promise<{ days: WeatherByDay[]; cache_hit: boolean; warning?: string }> {

    const { start: S, end: E } = this.normalizeRange(start, end);
    const key = `weather:v1:${city}:${S || "auto"}:${E || "auto"}`;

    const cached = await this.cache.get(key);
    if (cached) return { ...cached, cache_hit: true };

    try {
      const days = await this.primary.getForecast(city, S || "", E || "");
      const val = { days, cache_hit: false } as const;
      await this.cache.set(key, val, this.ttlSec);
      return val;
    } catch (e) {
      if (this.backup) {
        try {
          const days = await this.backup.getForecast(city, S || "", E || "");
          const val = { days, cache_hit: false, warning: "primary_failed" } as const;
          await this.cache.set(key, val, this.ttlSec);
          return val;
        } catch (e2) {
          return { days: [], cache_hit: false, warning: "weather_unavailable" };
        }
      }
      return { days: [], cache_hit: false, warning: "weather_unavailable" };
    }
  }
}