/**
 * Types + pure formatting shared between the server-only fetcher
 * (weather.ts) and client components — kept in a separate module with no
 * "server-only" import so WeatherClient.tsx can use it directly.
 */

export type DailyForecast = {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
};

export type Weather = {
  current: {
    temperature: number;
    weatherCode: number;
    windSpeed: number;
    humidity: number;
  };
  daily: DailyForecast[];
  frostRisk: boolean; // any day's min forecast at/below 2°C
  heavyRainRisk: boolean; // any day's precipitation forecast at/above 30mm
} | null;

/** WMO weather codes (used by Open-Meteo) mapped to a short label + emoji-free icon hint. */
export function describeWeatherCode(code: number): { label: string; icon: "sun" | "cloud" | "rain" | "storm" | "snow" | "fog" } {
  if (code === 0) return { label: "Clear sky", icon: "sun" };
  if (code <= 2) return { label: "Partly cloudy", icon: "cloud" };
  if (code === 3) return { label: "Overcast", icon: "cloud" };
  if (code === 45 || code === 48) return { label: "Fog", icon: "fog" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", icon: "rain" };
  if (code >= 61 && code <= 67) return { label: "Rain", icon: "rain" };
  if (code >= 71 && code <= 77) return { label: "Snow", icon: "snow" };
  if (code >= 80 && code <= 82) return { label: "Rain showers", icon: "rain" };
  if (code >= 85 && code <= 86) return { label: "Snow showers", icon: "snow" };
  if (code >= 95) return { label: "Thunderstorm", icon: "storm" };
  return { label: "Unknown", icon: "cloud" };
}
