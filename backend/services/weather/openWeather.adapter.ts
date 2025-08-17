// backend/services/weather/openWeather.adapter.ts
import type { WeatherAdapter, WeatherByDay } from "./weather.types";

type OWmDaily = {
  dt: number;
  temp: { day: number };
  feels_like?: { day: number };
  weather?: { main?: string; description?: string; icon?: string }[];
  pop?: number;    // precipitation probability (0~1)
  uvi?: number;
  wind_speed?: number;
  humidity?: number;
};

export class OpenWeatherAdapter implements WeatherAdapter {
  constructor(
    private apiKey: string,
    private baseUrl = "https://api.openweathermap.org/data/2.5"
  ) {}

  /**
   * city 支援 "Seoul,KR" / "Tokyo,JP" / "Taipei,TW"
   * 1) 用 geocoding API 取得 lat/lon
   * 2) 用 onecall 或 forecast/daily（新 API 用 onecall）拿未來 7 天
   */
  async getForecast(city: string, start?: string, end?: string): Promise<WeatherByDay[]> {
    const geo = await this.geocode(city);
    if (!geo) return [];

    const url = `${this.baseUrl}/onecall?lat=${geo.lat}&lon=${geo.lon}&exclude=minutely,hourly,alerts&units=metric&appid=${this.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OW_HTTP_${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data?.daily)) return [];

    const days = (data.daily as OWmDaily[]).slice(0, 7).map((d) => {
      const cond = normalize(d.weather?.[0]);
      return {
        date: toISODateUTC(d.dt),
        city,
        temp: safeNum(d.temp?.day),
        feels_like: safeNum(d.feels_like?.day),
        condition: cond,
        rain_prob: typeof d.pop === "number" ? Math.round(d.pop * 100) : undefined,
        uv: safeNum(d.uvi),
        wind: safeNum(d.wind_speed),
        humidity: safeNum(d.humidity),
        air_quality_index: undefined // 需另接 AQI 來源
      } as WeatherByDay;
    });

    // 若 start/end 有指定，可在此做 slice 過濾（簡化先全回）
    return days;
  }

  private async geocode(city: string): Promise<{ lat: number; lon: number } | null> {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${this.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OW_GEO_${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || !data[0]) return null;
    return { lat: data[0].lat, lon: data[0].lon };
  }
}

function toISODateUTC(unixSec: number): string {
  const d = new Date(unixSec * 1000);
  // 轉 ISO yyyy-mm-dd（UTC）
  return d.toISOString().slice(0, 10);
}

function normalize(w?: { main?: string; description?: string; icon?: string }): string {
  const s = (w?.description || w?.main || "").toLowerCase();
  if (s.includes("rain") || s.includes("shower")) return "陣雨";
  if (s.includes("snow")) return "雪";
  if (s.includes("cloud")) return "多雲";
  if (s.includes("clear")) return "晴";
  if (s.includes("thunder")) return "雷雨";
  return w?.description || "不確定";
}

function safeNum(n: any): number | undefined {
  const v = Number(n);
  return Number.isFinite(v) ? v : undefined;
}