import { pageMetadata } from "@/lib/seo";
import { getDistricts } from "@/lib/data";
import { fetchWeather } from "@/lib/weather";
import { WeatherClient } from "@/components/WeatherClient";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function WeatherPage({
  searchParams,
}: {
  searchParams: Promise<{ district?: string }>;
}) {
  const params = await searchParams;
  const districts = await getDistricts();
  const selected = params.district
    ? districts.find((d) => String(d.id) === params.district)
    : districts.find((d) => d.name === "Kathmandu") ?? districts[0];

  const weather = selected?.latitude != null && selected?.longitude != null
    ? await fetchWeather(selected.latitude, selected.longitude)
    : null;

  return (
    <div>
      <SupabaseSetupNotice />
      <WeatherClient districts={districts} selected={selected ?? null} weather={weather} />
    </div>
  );
}

export const metadata = pageMetadata("कृषि मौसम · District weather", "नेपालका जिल्लाको मौसम र पूर्वानुमान हेर्नुहोस्। District weather observations and forecasts to support farm planning.", "/weather");
