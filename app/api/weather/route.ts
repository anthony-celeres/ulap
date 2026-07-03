import { type NextRequest, NextResponse } from "next/server";
import type {
  AirQuality,
  CitySummary,
  CurrentWeather,
  OpenMeteoForecast,
  WeatherPayload,
} from "../../types/weather";
import { toDailyForecast, toHourlyPoints } from "../../utils/weather";

// Server-only key; the NEXT_PUBLIC_ fallback keeps older .env.local files working.
const API_KEY = process.env.OPENWEATHER_API_KEY ?? process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const OM_URL = "https://api.open-meteo.com/v1/forecast";
/** The app is Philippines-only: every name-based lookup is country-filtered. */
const COUNTRY = "PH";

const FIXED_CITIES = [
  { name: "Cebu City", region: "Cebu" },
  { name: "Davao City", region: "Davao del Sur" },
  { name: "Baguio", region: "Benguet" },
];

/** Weather observations change slowly; cache upstream responses for 10 minutes. */
const REVALIDATE = { next: { revalidate: 600 } };

export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "missing_key" }, { status: 503 });
  }

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q");
  const lat = sp.get("lat");
  const lon = sp.get("lon");
  if (!q && (!lat || !lon)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const query = q ? `q=${encodeURIComponent(q)},${COUNTRY}` : `lat=${lat}&lon=${lon}`;

  const curRes = await fetch(`${BASE_URL}/weather?${query}&units=metric&appid=${API_KEY}`, REVALIDATE);
  if (!curRes.ok) {
    return NextResponse.json(
      { error: curRes.status === 404 ? "not_found" : "upstream" },
      { status: curRes.status === 404 ? 404 : 502 }
    );
  }
  const current: CurrentWeather = await curRes.json();

  const [omRes, airRes, cities] = await Promise.all([
    fetch(
      `${OM_URL}?latitude=${current.coord.lat}&longitude=${current.coord.lon}` +
        `&hourly=temperature_2m,precipitation_probability,weather_code,uv_index` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=8&timezone=auto`,
      REVALIDATE
    ),
    fetch(`${BASE_URL}/air_pollution?lat=${current.coord.lat}&lon=${current.coord.lon}&appid=${API_KEY}`, REVALIDATE),
    Promise.all(
      FIXED_CITIES.map(async (f): Promise<CitySummary | null> => {
        const r = await fetch(
          `${BASE_URL}/weather?q=${encodeURIComponent(f.name)},${COUNTRY}&units=metric&appid=${API_KEY}`,
          REVALIDATE
        );
        if (!r.ok) return null;
        const d: CurrentWeather = await r.json();
        return {
          name: f.name,
          country: f.region,
          condition: d.weather[0].main,
          code: d.weather[0].id,
          temp: Math.round(d.main.temp),
        };
      })
    ),
  ]);

  let hourly: WeatherPayload["hourly"] = [];
  let days: WeatherPayload["days"] = [];
  if (omRes.ok) {
    const om: OpenMeteoForecast = await omRes.json();
    hourly = toHourlyPoints(om);
    days = toDailyForecast(om);
  }

  let air: AirQuality | null = null;
  if (airRes.ok) {
    const airData = await airRes.json();
    const entry = airData.list?.[0];
    air = entry ? { aqi: entry.main.aqi, components: entry.components } : null;
  }

  const payload: WeatherPayload = {
    current,
    hourly,
    days,
    air,
    cities: cities.filter((c): c is CitySummary => c !== null),
  };
  return NextResponse.json(payload);
}
