"use client";

import { useCallback, useEffect, useState } from "react";
import { Cloud, TriangleAlert, X } from "lucide-react";
import TopBar from "./components/TopBar";
import TodayCard from "./components/TodayCard";
import ForecastCard from "./components/ForecastCard";
import RainChart from "./components/RainChart";
import AirQualityCard from "./components/AirQualityCard";
import MapSection from "./components/MapSection";
import CitiesList from "./components/CitiesList";
import type {
  AirQuality,
  CitySummary,
  CurrentWeather,
  DailyForecast,
  ForecastResponse,
  GeoSuggestion,
} from "./types/weather";
import {
  fmtHour,
  fmtTime,
  getDayName,
  getShortDay,
  groupForecastByDay,
  msToKmh,
} from "./utils/weather";

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const DEFAULT_CITY = "Manila";
const LAST_CITY_KEY = "ulap-last-city";
/** The app is Philippines-only: every name-based lookup is country-filtered. */
export const COUNTRY = "PH";

const FIXED_CITIES = [
  { name: "Cebu City", region: "Cebu" },
  { name: "Davao City", region: "Davao del Sur" },
  { name: "Baguio", region: "Benguet" },
];

type Query = string | { lat: number; lon: number };
type Panel = "rain" | "air";

function queryString(q: Query) {
  return typeof q === "string" ? `q=${encodeURIComponent(q)},${COUNTRY}` : `lat=${q.lat}&lon=${q.lon}`;
}

export default function Home() {
  const [city, setCity] = useState("");
  const [inputCity, setInputCity] = useState("");
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [days, setDays] = useState<DailyForecast[]>([]);
  const [air, setAir] = useState<AirQuality | null>(null);
  const [otherCities, setOtherCities] = useState<CitySummary[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [panel, setPanel] = useState<Panel>("rain");
  // No key → the setup notice renders instead, so nothing is ever loading.
  const [loading, setLoading] = useState(Boolean(API_KEY));
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = useCallback(async (query: Query) => {
    setLoading(true);
    setError(null);
    try {
      const curRes = await fetch(`${BASE_URL}/weather?${queryString(query)}&units=metric&appid=${API_KEY}`);
      if (!curRes.ok) {
        throw new Error(
          curRes.status === 404
            ? "City not found — check the spelling and try again."
            : "The weather service is unavailable right now — please try again."
        );
      }
      const cur: CurrentWeather = await curRes.json();
      setCurrent(cur);
      setCity(cur.name);
      setInputCity(cur.name);
      setSelectedDay(0);
      try {
        localStorage.setItem(LAST_CITY_KEY, cur.name);
      } catch {
        // storage unavailable — skip persistence
      }

      const [forRes, airRes, others] = await Promise.all([
        fetch(`${BASE_URL}/forecast?${queryString(query)}&units=metric&appid=${API_KEY}`),
        fetch(`${BASE_URL}/air_pollution?lat=${cur.coord.lat}&lon=${cur.coord.lon}&appid=${API_KEY}`),
        Promise.all(
          FIXED_CITIES.map(async (f): Promise<CitySummary | null> => {
            const r = await fetch(
              `${BASE_URL}/weather?q=${encodeURIComponent(f.name)},${COUNTRY}&units=metric&appid=${API_KEY}`
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

      if (forRes.ok) {
        const forecast: ForecastResponse = await forRes.json();
        setDays(groupForecastByDay(forecast.list, forecast.city.timezone));
      } else {
        setDays([]);
      }

      if (airRes.ok) {
        const airData = await airRes.json();
        const entry = airData.list?.[0];
        setAir(entry ? { aqi: entry.main.aqi, components: entry.components } : null);
      } else {
        setAir(null);
      }

      setOtherCities(others.filter((c): c is CitySummary => c !== null));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!API_KEY) return;
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(LAST_CITY_KEY);
    } catch {
      // storage unavailable — fall back to the default city
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount; loading already starts true
    fetchWeatherData(saved || DEFAULT_CITY);
  }, [fetchWeatherData]);

  const handleSearch = (newCity: string) => {
    if (newCity.trim()) fetchWeatherData(newCity.trim());
  };

  const handleSelectLocation = useCallback(
    (place: GeoSuggestion) => {
      fetchWeatherData({ lat: place.lat, lon: place.lon });
    },
    [fetchWeatherData]
  );

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeatherData({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setError("Couldn't get your location — allow location access and try again.")
    );
  }, [fetchWeatherData]);

  if (!API_KEY) {
    return <MissingKeyNotice />;
  }

  const tz = current?.timezone ?? 0;
  const selected = days[selectedDay];
  // For "Today", roll into tomorrow's slots so the chart always covers ~24h
  // (late in the evening only one or two of today's 3-hour slots remain).
  const rainSlots =
    selectedDay === 0
      ? [...(days[0]?.slots ?? []), ...(days[1]?.slots ?? [])]
      : selected?.slots ?? [];
  const rainData = rainSlots.slice(0, 8).map((s) => ({
    label: fmtHour(s.dt, tz),
    pop: Math.round(s.pop * 100),
  }));
  const selectedDayName =
    selectedDay === 0 ? "next 24h" : selectedDay === 1 ? "Tomorrow" : selected ? getDayName(selected.dt, tz) : "";

  const dayTabClass = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm cursor-pointer transition-shadow duration-150 ${
      active ? "neu-sm font-semibold text-accent" : "font-medium text-muted hover:text-ink"
    }`;

  return (
    <main className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6" aria-busy={loading}>
      <TopBar
        city={current ? city : "—"}
        country={current?.sys.country}
        inputCity={inputCity}
        loading={loading}
        onCityInput={setInputCity}
        onSearch={handleSearch}
        onSelectLocation={handleSelectLocation}
        onLocate={handleLocate}
      />

      {error && current && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 mb-6 px-5 py-3 rounded-2xl neu-sm text-sm text-red-600 dark:text-red-400"
        >
          <span className="flex items-center gap-2">
            <TriangleAlert size={16} aria-hidden="true" /> {error}
          </span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="cursor-pointer hover:opacity-70"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {!current && loading ? (
        <DashboardSkeleton />
      ) : !current ? (
        <div className="flex flex-col items-center justify-center p-10 rounded-3xl neu">
          <strong className="flex items-center gap-2 text-lg text-ink">
            <TriangleAlert size={20} className="text-amber-500" aria-hidden="true" /> Could not load weather
          </strong>
          <span className="mt-1 text-sm text-muted">{error}</span>
          <button
            type="button"
            onClick={() => fetchWeatherData(inputCity.trim() || DEFAULT_CITY)}
            className="mt-5 bg-hero-grad text-white px-6 py-2.5 rounded-full text-sm font-semibold cursor-pointer neu-sm hover:opacity-90 transition-opacity duration-150"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex gap-1 p-1.5 rounded-full neu-inset-sm" role="group" aria-label="Forecast day">
              <button type="button" className={dayTabClass(selectedDay === 0)} onClick={() => setSelectedDay(0)}>
                Today
              </button>
              <button
                type="button"
                className={dayTabClass(selectedDay === 1)}
                onClick={() => setSelectedDay(1)}
                disabled={days.length < 2}
              >
                Tomorrow
              </button>
            </div>
            <div className="ml-auto flex gap-1 p-1.5 rounded-full neu-inset-sm" role="group" aria-label="Chart panel">
              <button type="button" className={dayTabClass(panel === "rain")} onClick={() => setPanel("rain")}>
                Forecast
              </button>
              <button type="button" className={dayTabClass(panel === "air")} onClick={() => setPanel("air")}>
                Air quality
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6">
            <div className="lg:col-span-4 xl:col-span-3">
              <TodayCard
                day={getDayName(current.dt, tz)}
                time={fmtTime(current.dt, tz)}
                code={current.weather[0].id}
                condition={current.weather[0].description}
                temp={Math.round(current.main.temp)}
                realFeel={Math.round(current.main.feels_like)}
                windKmh={msToKmh(current.wind.speed)}
                pressure={current.main.pressure}
                humidity={current.main.humidity}
                sunrise={fmtTime(current.sys.sunrise, tz)}
                sunset={fmtTime(current.sys.sunset, tz)}
              />
            </div>

            {/* auto-fit collapses unused tracks, so late-night days-remaining < 5 still fills the row */}
            <div className="lg:col-span-8 xl:col-span-6 grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-4 xl:gap-5">
              {days.slice(1, 6).map((d, i) => (
                <ForecastCard
                  key={d.key}
                  dayName={getShortDay(d.dt, tz)}
                  code={d.code}
                  condition={d.condition}
                  min={d.min}
                  max={d.max}
                  selected={selectedDay === i + 1}
                  onSelect={() => setSelectedDay(i + 1)}
                />
              ))}
            </div>

            <div className="lg:col-span-12 xl:col-span-3">
              {panel === "rain" ? (
                <RainChart dayName={selectedDayName} data={rainData} />
              ) : (
                <AirQualityCard air={air} dayName="now" />
              )}
            </div>

            <div className="lg:col-span-8 xl:col-span-9">
              <MapSection city={city} lat={current.coord.lat} lon={current.coord.lon} />
            </div>
            <div className="lg:col-span-4 xl:col-span-3">
              <CitiesList cities={otherCities} onSelect={handleSearch} />
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6" aria-hidden="true">
      <div className="lg:col-span-4 xl:col-span-3 h-[360px] rounded-3xl bg-well neu-inset-sm animate-pulse" />
      <div className="lg:col-span-8 xl:col-span-6 grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-[360px] lg:h-full rounded-3xl bg-well neu-inset-sm animate-pulse" />
        ))}
      </div>
      <div className="lg:col-span-12 xl:col-span-3 h-[360px] rounded-3xl bg-well neu-inset-sm animate-pulse" />
      <div className="lg:col-span-8 xl:col-span-9 h-[320px] rounded-3xl bg-well neu-inset-sm animate-pulse" />
      <div className="lg:col-span-4 xl:col-span-3 h-[320px] rounded-3xl bg-well neu-inset-sm animate-pulse" />
    </div>
  );
}

function MissingKeyNotice() {
  return (
    <main className="max-w-xl mx-auto p-8 min-h-screen flex items-center">
      <div className="rounded-3xl neu p-8 w-full">
        <h1 className="flex items-center gap-2 text-2xl font-bold mb-2">
          <Cloud size={28} className="text-accent" fill="currentColor" strokeWidth={0} aria-hidden="true" />
          <span className="text-gradient">ulap</span>
        </h1>
        <p className="text-sm text-muted mb-4">
          Almost there — the app needs an OpenWeatherMap API key to fetch live weather.
        </p>
        <ol className="list-decimal list-inside text-sm text-ink space-y-2">
          <li>
            Get a free key at{" "}
            <a
              className="text-accent underline"
              href="https://openweathermap.org/api"
              target="_blank"
              rel="noopener noreferrer"
            >
              openweathermap.org/api
            </a>
          </li>
          <li>
            Create <code className="rounded-md neu-inset-sm px-1.5 py-0.5 text-xs">.env.local</code> in the project root:
            <pre className="rounded-xl neu-inset-sm p-3 mt-2 text-xs overflow-x-auto">
              NEXT_PUBLIC_OPENWEATHER_API_KEY=your_key_here
            </pre>
          </li>
          <li>Restart the dev server.</li>
        </ol>
      </div>
    </main>
  );
}
