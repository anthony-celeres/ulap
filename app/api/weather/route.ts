import { type NextRequest, NextResponse } from "next/server";
import type {
  AirQuality,
  CitySummary,
  CurrentWeather,
  OpenMeteoForecast,
  WeatherPayload,
} from "../../types/weather";
import {
  toDailyForecast,
  toHourlyPoints,
  interpolateOwmForecast,
  owmToDailyForecast,
  wmoToIconCode,
  wmoDescription,
  type OwmForecastItem,
} from "../../utils/weather";

// Server-only key; the NEXT_PUBLIC_ fallback keeps older .env.local files working.
const API_KEY = process.env.OPENWEATHER_API_KEY ?? process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const OM_URL = "https://api.open-meteo.com/v1/forecast";
/** The app is Philippines-only: every name-based lookup is country-filtered. */
const COUNTRY = "PH";

// Coordinates so the sidebar can go through Open-Meteo (same source as the rest
// of the app). One more than we show, so dropping the city in view still fills
// the four-card row.
const FIXED_CITIES = [
  { name: "Manila", region: "Metro Manila", lat: 14.5995, lon: 120.9842 },
  { name: "Cebu City", region: "Cebu", lat: 10.3157, lon: 123.8854 },
  { name: "Davao City", region: "Davao del Sur", lat: 7.1907, lon: 125.4553 },
  { name: "Baguio", region: "Benguet", lat: 16.4023, lon: 120.596 },
  { name: "Iloilo City", region: "Iloilo", lat: 10.7202, lon: 122.5621 },
];

// Always fetch live upstream: when the user is online they get real-time
// weather. Offline handling is the client's job — it falls back to the last
// payload saved in localStorage.
const NO_CACHE = { cache: "no-store" } as const;

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

  try {
    const curRes = await fetch(`${BASE_URL}/weather?${query}&units=metric&appid=${API_KEY}`, NO_CACHE);
    if (!curRes.ok) {
      return NextResponse.json(
        { error: curRes.status === 404 ? "not_found" : "upstream" },
        { status: curRes.status === 404 ? 404 : 502 }
      );
    }
    const current: CurrentWeather = await curRes.json();

    const safeFetch = async (url: string, init?: RequestInit) => {
      try {
        const res = await fetch(url, init);
        return res.ok ? res : null;
      } catch {
        return null;
      }
    };

    // "Around the Philippines" shows other major cities: drop whichever fixed
    // city you're currently viewing (within ~35 km), then keep four.
    const near = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) =>
      Math.abs(a.lat - b.lat) < 0.35 && Math.abs(a.lon - b.lon) < 0.35;
    const sidebarCities = FIXED_CITIES.filter((c) => !near(c, current.coord)).slice(0, 4);

    const [omRes, airRes, citiesRes] = await Promise.all([
      safeFetch(
        `${OM_URL}?latitude=${current.coord.lat}&longitude=${current.coord.lon}` +
          `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m` +
          `&hourly=temperature_2m,precipitation_probability,weather_code,uv_index` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
          `&wind_speed_unit=ms&forecast_days=8&timezone=auto`,
        NO_CACHE
      ),
      safeFetch(`${BASE_URL}/air_pollution?lat=${current.coord.lat}&lon=${current.coord.lon}&appid=${API_KEY}`, NO_CACHE),
      // One Open-Meteo call covers all sidebar cities via comma-separated coords.
      safeFetch(
        `${OM_URL}?latitude=${sidebarCities.map((c) => c.lat).join(",")}` +
          `&longitude=${sidebarCities.map((c) => c.lon).join(",")}` +
          `&current=temperature_2m,weather_code&timezone=auto`,
        NO_CACHE
      ),
    ]);

    let hourly: WeatherPayload["hourly"] = [];
    let days: WeatherPayload["days"] = [];
    if (omRes) {
      const om: OpenMeteoForecast = await omRes.json();
      hourly = toHourlyPoints(om);
      days = toDailyForecast(om);
      // Drive the current-conditions card from Open-Meteo too, so the headline
      // temp and sky condition come from the same model as the hourly strip,
      // rain chart, and daily view instead of OWM's (which disagreed by a few
      // degrees and could show "clear sky" over a rainy forecast). OWM still
      // supplies the place name, coords, timezone, and sunrise/sunset.
      if (om.current) {
        current.main.temp = om.current.temperature_2m;
        current.main.feels_like = om.current.apparent_temperature;
        current.main.humidity = Math.round(om.current.relative_humidity_2m);
        current.main.pressure = Math.round(om.current.surface_pressure);
        current.wind.speed = om.current.wind_speed_10m;
        current.weather = [
          {
            id: wmoToIconCode(om.current.weather_code),
            main: current.weather[0]?.main ?? "",
            description: wmoDescription(om.current.weather_code),
          },
        ];
      }
    } else {
      try {
        const owmForecastUrl = `${BASE_URL}/forecast?lat=${current.coord.lat}&lon=${current.coord.lon}&units=metric&appid=${API_KEY}`;
        const uviUrl = `${BASE_URL}/uvi?lat=${current.coord.lat}&lon=${current.coord.lon}&appid=${API_KEY}`;

        const [fRes, uRes] = await Promise.all([
          fetch(owmForecastUrl, NO_CACHE),
          fetch(uviUrl, NO_CACHE).catch(() => null)
        ]);

        if (fRes.ok) {
          const fData: { list: OwmForecastItem[] } = await fRes.json();
          let peakUv = 0;
          if (uRes && uRes.ok) {
            const uData: { value: number } = await uRes.json();
            peakUv = uData.value;
          }

          const todayMinTemp = fData.list.length > 0
            ? Math.min(...fData.list.slice(0, 8).map((item) => item.main.temp_min))
            : current.main.temp - 5;
          hourly = interpolateOwmForecast(fData.list, current.timezone, current.main.temp, current.weather[0].id, todayMinTemp);

          // Apply daylight sine curve UV distribution for OWM fallback hourly points
          if (peakUv > 0) {
            hourly = hourly.map((h) => {
              const localTime = new Date(h.dt * 1000);
              const hourNum = localTime.getUTCHours();
              let uvVal = 0;
              if (hourNum >= 6 && hourNum <= 18) {
                uvVal = peakUv * Math.sin(((hourNum - 6) / 12) * Math.PI);
              }
              return {
                ...h,
                uv: parseFloat(uvVal.toFixed(2)),
              };
            });
          }

          days = owmToDailyForecast(fData.list, current.timezone);
        }
      } catch (fErr) {
        console.error("OWM forecast fallback failure:", fErr);
      }
    }

    let air: AirQuality | null = null;
    if (airRes) {
      const airData = await airRes.json();
      const entry = airData.list?.[0];
      air = entry ? { aqi: entry.main.aqi, components: entry.components } : null;
    }

    let cities: CitySummary[] = [];
    if (citiesRes) {
      const raw: unknown = await citiesRes.json();
      // Open-Meteo returns an array for multiple coords, a single object for one.
      const arr = Array.isArray(raw) ? raw : [raw];
      cities = sidebarCities
        .map((c, i): CitySummary | null => {
          const cur = arr[i]?.current;
          if (!cur) return null;
          return {
            name: c.name,
            country: c.region,
            condition: wmoDescription(cur.weather_code),
            code: wmoToIconCode(cur.weather_code),
            temp: Math.round(cur.temperature_2m),
          };
        })
        .filter((c): c is CitySummary => c !== null);
    }

    const payload: WeatherPayload = {
      current,
      hourly,
      days,
      air,
      cities,
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("Weather endpoint error:", err);
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}
