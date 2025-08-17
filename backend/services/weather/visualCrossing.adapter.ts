// backend/services/weather/visualCrossing.adapter.ts
import type { WeatherAdapter, WeatherByDay } from "./weather.types";

export class VisualCrossingAdapter implements WeatherAdapter {
  constructor(
    private apiKey: string,
    private baseUrl = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline"
  ) {}

  async getForecast(city: string, start: string, end: string): Promise<WeatherByDay[]> {
    // 支援 AUTO_TODAY / +Nd 語法（由 Service 正規化再傳進來也可）
    const range = start && end ? `${start}/${end}` : "next7days";

    const url = `${this.baseUrl}/${encodeURIComponent(city)}/${range}?unitGroup=metric&include=days&key=${this.apiKey}&contentType=json`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`VC_HTTP_${res.status}`);
    const data = await res.json();

    if (!data?.days?.length) return [];

    const out: WeatherByDay[] = data.days.map((d: any) => ({
      date: d.datetime,                          // "2025-09-20"
      city,
      temp: Number(d.temp) ?? undefined,
      feels_like: Number(d.feelslike) ?? undefined,
      condition: normalizeCondition(d.conditions, d.icon),
      rain_prob: Number(d.precipprob) ?? undefined,
      uv: Number(d.uvindex) ?? undefined,
      wind: Number(d.windspeed) ?? undefined,
      humidity: Number(d.humidity) ?? undefined,
      air_quality_index: undefined               // VC 無 AQI，可由備援源補
    }));

    return out;
  }
}

function normalizeCondition(conditions?: string, icon?: string): string {
  const s = (conditions || icon || "").toLowerCase();
  if (s.includes("rain") || s.includes("showers")) return "陣雨";
  if (s.includes("snow")) return "雪";
  if (s.includes("partly") || s.includes("cloud")) return "多雲";
  if (s.includes("clear") || s.includes("sunny")) return "晴";
  return conditions || "不確定";
}