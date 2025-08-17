// backend/services/integrator.example.ts
import { analyzeIntent } from "../../frontend/lib/core/intentParser";
import { weatherService } from "./weather.integrated";

export async function handleUserQuery(input: { text: string; images?: string[] }) {
  const intent = analyzeIntent({
    text: input.text,
    images: input.images?.map(u => ({ type: "full_body", url: u }))
  });

  const wx = intent.needs_weather && intent.destinations?.[0] && intent.date_range
    ? await weatherService.forecast(intent.destinations[0], intent.date_range.start, intent.date_range.end)
    : { days: [] as any[], cache_hit: false };

  return { intent, weather_by_day: wx.days, weather_warning: (wx as any).warning };
}