// backend/services/weather.integrated.ts
// 整合的 Weather Service 配置，主備降級完整版

import { WeatherService } from "./weather.service";
import { VisualCrossingAdapter } from "./weather/visualCrossing.adapter";
import { OpenWeatherAdapter } from "./weather/openWeather.adapter";

// 創建整合的 Weather Service（主：VC；備：OWM）
export const createWeatherService = () => {
  const vcApiKey = process.env.VC_API_KEY;
  const owmApiKey = process.env.OWM_API_KEY;
  
  if (!vcApiKey) {
    throw new Error("VC_API_KEY is required in environment variables");
  }
  
  const primary = new VisualCrossingAdapter(vcApiKey);
  const backup = owmApiKey ? new OpenWeatherAdapter(owmApiKey) : undefined;
  
  return new WeatherService(primary, backup);
};

// 預設實例（可直接匯入使用）
export const weatherService = createWeatherService();