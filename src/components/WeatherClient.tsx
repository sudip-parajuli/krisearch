"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, Droplets, Wind, AlertTriangle, CloudDrizzle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { describeWeatherCode } from "@/lib/weather-format";
import { EmptyState } from "./EmptyState";
import type { District } from "@/types/database";
import type { Weather } from "@/lib/weather-format";

const iconMap = { sun: Sun, cloud: Cloud, rain: CloudRain, storm: CloudLightning, snow: Snowflake, fog: CloudFog };

export function WeatherClient({ districts, selected, weather }: { districts: District[]; selected: District | null; weather: Weather }) {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function selectDistrict(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("district", id);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">{t("weatherTitle")}</h1>
        <p className="mt-1 text-sm text-neutral-500">{t("weatherSubtitle")}</p>
      </div>

      <select
        value={selected?.id ?? ""}
        onChange={(e) => selectDistrict(e.target.value)}
        className="w-full max-w-xs rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      >
        <option value="">{t("weatherSelectDistrict")}</option>
        {districts.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      {!selected ? (
        <EmptyState icon={Cloud} title={t("weatherSelectDistrict")} />
      ) : selected.latitude == null ? (
        <EmptyState icon={Cloud} title={t("weatherNoCoords")} />
      ) : !weather ? (
        <EmptyState icon={Cloud} title={t("weatherUnavailable")} />
      ) : (
        <>
          {(weather.frostRisk || weather.heavyRainRisk) && (
            <div className="flex flex-col gap-2">
              {weather.frostRisk && (
                <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> {t("frostWarning")}
                </div>
              )}
              {weather.heavyRainRisk && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> {t("heavyRainWarning")}
                </div>
              )}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-gradient-to-br from-green-700 to-green-900 p-6 text-white shadow-lg"
          >
            <p className="text-sm text-green-100">{selected.name}</p>
            <div className="mt-1 flex items-center gap-3">
              {(() => {
                const desc = describeWeatherCode(weather.current.weatherCode);
                const Icon = iconMap[desc.icon];
                return (
                  <>
                    <Icon className="h-12 w-12" strokeWidth={1.5} />
                    <div>
                      <p className="font-display text-4xl font-semibold">{Math.round(weather.current.temperature)}°C</p>
                      <p className="text-sm text-green-100">{desc.label}</p>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="mt-4 flex gap-6 text-sm text-green-100">
              <span className="flex items-center gap-1.5">
                <Droplets className="h-4 w-4" /> {t("humidity")}: {weather.current.humidity}%
              </span>
              <span className="flex items-center gap-1.5">
                <Wind className="h-4 w-4" /> {t("wind")}: {Math.round(weather.current.windSpeed)} km/h
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
            {weather.daily.map((day, i) => {
              const desc = describeWeatherCode(day.weatherCode);
              const Icon = iconMap[desc.icon];
              const date = new Date(day.date);
              return (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex flex-col items-center gap-1 rounded-xl border border-neutral-200 bg-white p-3 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <p className="text-xs font-medium text-neutral-500">
                    {i === 0 ? t("today") : date.toLocaleDateString(lang === "ne" ? "ne-NP" : "en-US", { weekday: "short" })}
                  </p>
                  <Icon className="h-6 w-6 text-green-600 dark:text-green-400" strokeWidth={1.75} />
                  <p className="text-xs font-semibold">
                    {Math.round(day.tempMax)}° <span className="font-normal text-neutral-400">{Math.round(day.tempMin)}°</span>
                  </p>
                  {day.precipitationSum > 0 && (
                    <p className="flex items-center gap-0.5 text-[10px] text-blue-500">
                      <CloudDrizzle className="h-2.5 w-2.5" /> {Math.round(day.precipitationSum)}mm
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
