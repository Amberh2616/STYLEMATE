// backend/services/weather/weather.types.ts
export interface WeatherByDay {
  date: string;
  city?: string;
  temp: number;
  feels_like?: number;
  condition: string;
  rain_prob?: number;
  uv?: number;
  wind?: number;
  humidity?: number;
  air_quality_index?: number;
}

export interface WeatherAdapter {
  getForecast(city: string, start: string, end: string): Promise<WeatherByDay[]>;
}