import "server-only";
import type { DailyForecast, Weather } from "./weather-format";

/**
 * Open-Meteo (https://open-meteo.com) — genuinely free, no API key, no
 * account, 10,000 calls/day. District coordinates are the district HQ town
 * (approximate) — general guidance, same honesty framing as everything
 * else in the facts layer, not precise for every village in a district.
 */

export type { DailyForecast, Weather };

export async function fetchWeather(latitude: number, longitude: number): Promise<Weather> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("current", "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m");
    url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum");
    url.searchParams.set("timezone", "Asia/Kathmandu");
    url.searchParams.set("forecast_days", "7");

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10_000), next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const data = await res.json();

    const daily: DailyForecast[] = data.daily.time.map((date: string, i: number) => ({
      date,
      weatherCode: data.daily.weather_code[i],
      tempMax: data.daily.temperature_2m_max[i],
      tempMin: data.daily.temperature_2m_min[i],
      precipitationSum: data.daily.precipitation_sum[i],
    }));

    return {
      current: {
        temperature: data.current.temperature_2m,
        weatherCode: data.current.weather_code,
        windSpeed: data.current.wind_speed_10m,
        humidity: data.current.relative_humidity_2m,
      },
      daily,
      frostRisk: daily.some((d) => d.tempMin <= 2),
      heavyRainRisk: daily.some((d) => d.precipitationSum >= 30),
    };
  } catch {
    return null;
  }
}
