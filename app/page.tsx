"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Cloud, RefreshCw, TriangleAlert, X } from "lucide-react";
import TopBar from "./components/TopBar";
import TodayCard from "./components/TodayCard";
import ForecastCard from "./components/ForecastCard";
import HourlyStrip from "./components/HourlyStrip";
import RainChart from "./components/RainChart";
import AirQualityCard from "./components/AirQualityCard";
import MapSection from "./components/MapSection";
import CitiesList from "./components/CitiesList";
import Carousel from "./components/Carousel";
import type {
  AirQuality,
  CitySummary,
  CurrentWeather,
  DailyForecast,
  GeoSuggestion,
  HourlyPoint,
  WeatherPayload,
} from "./types/weather";
import { fmtHour, fmtTime, getDayName, getShortDay, msToKmh } from "./utils/weather";

const DEFAULT_CITY = "Manila";
const LAST_CITY_KEY = "ulap-last-city";
/** Weather observations refresh roughly every 10 minutes upstream. */
const REFRESH_MS = 10 * 60 * 1000;

type Query = string | { lat: number; lon: number };
type Panel = "rain" | "air";
/** Google Weather-style views: hourly today, or the next days at a glance. */
type View = "today" | "week";

function queryToParams(q: Query) {
  return typeof q === "string" ? `q=${encodeURIComponent(q)}` : `lat=${q.lat}&lon=${q.lon}`;
}

export default function Home() {
  const [city, setCity] = useState("");
  const [inputCity, setInputCity] = useState("");
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [days, setDays] = useState<DailyForecast[]>([]);
  const [hourlyAll, setHourlyAll] = useState<HourlyPoint[]>([]);
  const [air, setAir] = useState<AirQuality | null>(null);
  const [otherCities, setOtherCities] = useState<CitySummary[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [view, setView] = useState<View>("today");
  const [panel, setPanel] = useState<Panel>("rain");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missingKey, setMissingKey] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const updatedAtRef = useRef(0);

  const fetchWeatherData = useCallback(async (query: Query, opts?: { silent?: boolean }) => {
    // A newer request supersedes any in-flight one.
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    if (!opts?.silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?${queryToParams(query)}`, { signal: ac.signal });
      if (!res.ok) {
        const body: { error?: string } = await res.json().catch(() => ({}));
        if (body.error === "missing_key") {
          setMissingKey(true);
          return;
        }
        throw new Error(
          res.status === 404
            ? "City not found — check the spelling and try again."
            : "The weather service is unavailable right now — please try again."
        );
      }
      const payload: WeatherPayload = await res.json();
      setCurrent(payload.current);
      setHourlyAll(payload.hourly);
      setDays(payload.days);
      setAir(payload.air);
      setOtherCities(payload.cities);
      setCity(payload.current.name);
      setInputCity(payload.current.name);
      if (!opts?.silent) setSelectedDay(0);
      updatedAtRef.current = Date.now();
      setUpdatedAt(updatedAtRef.current);
      setAnnouncement(`Weather for ${payload.current.name} updated`);
      try {
        localStorage.setItem(LAST_CITY_KEY, payload.current.name);
      } catch {
        // storage unavailable — skip persistence
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to fetch weather.");
    } finally {
      if (abortRef.current === ac) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(LAST_CITY_KEY);
    } catch {
      // storage unavailable — fall back to the default city
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount; loading already starts true
    fetchWeatherData(saved || DEFAULT_CITY);
  }, [fetchWeatherData]);

  // Keep the data fresh: silent refetch on an interval and on tab refocus.
  useEffect(() => {
    if (!current) return;
    const coords = { lat: current.coord.lat, lon: current.coord.lon };
    const refresh = () => fetchWeatherData(coords, { silent: true });
    const id = setInterval(refresh, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - updatedAtRef.current > REFRESH_MS) {
        refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [current, fetchWeatherData]);

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

  if (missingKey) {
    return <MissingKeyNotice />;
  }

  const tz = current?.timezone ?? 0;
  const selected = days[selectedDay];
  // Open-Meteo hours are calendar-aligned: 24 entries per local day.
  const todayHours = hourlyAll.slice(0, 24);
  const rainData = hourlyAll
    .slice(selectedDay * 24, selectedDay * 24 + 24)
    .filter((_, i) => i % 3 === 0)
    .map((h) => ({ label: fmtHour(h.dt, 0), pop: Math.round(h.pop) }));
  const selectedDayName =
    selectedDay === 0 ? "Today" : selectedDay === 1 ? "Tomorrow" : selected ? getDayName(selected.dt, 0) : "";

  const dayTabClass = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm cursor-pointer transition-shadow duration-150 ${
      active ? "neu-sm font-semibold text-accent" : "font-medium text-muted hover:text-ink"
    }`;

  return (
    <main className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6" aria-busy={loading}>
      {/* Announces search/refresh results to assistive tech. */}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
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
            <div className="flex gap-1 p-1.5 rounded-full neu-inset-sm" role="group" aria-label="Forecast view">
              <button
                type="button"
                className={dayTabClass(view === "today")}
                onClick={() => {
                  setView("today");
                  setSelectedDay(0);
                }}
              >
                Today
              </button>
              <button
                type="button"
                className={dayTabClass(view === "week")}
                onClick={() => setView("week")}
                disabled={days.length < 2}
              >
                Next 6 days
              </button>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <UpdatedBadge
                updatedAt={updatedAt}
                loading={loading}
                onRefresh={() => fetchWeatherData({ lat: current.coord.lat, lon: current.coord.lon }, { silent: true })}
              />
              <div className="flex gap-1 p-1.5 rounded-full neu-inset-sm" role="group" aria-label="Chart panel">
                <button type="button" className={dayTabClass(panel === "rain")} onClick={() => setPanel("rain")}>
                  Forecast
                </button>
                <button type="button" className={dayTabClass(panel === "air")} onClick={() => setPanel("air")}>
                  Air quality
                </button>
              </div>
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

            {/* The forecast strip gets the full remaining width; the
                rain/air panel lives on the second row beside the map. */}
            <div className="lg:col-span-8 xl:col-span-9">
              {view === "today" ? (
                <HourlyStrip hours={todayHours} nowDt={current.dt + tz} />
              ) : (
                <Carousel ariaLabel="Daily forecast for the next 6 days">
                  {days.slice(0, 7).map((d, i) => (
                    <div key={d.key} role="listitem" className="w-[136px] shrink-0 snap-start h-full">
                      <ForecastCard
                        dayName={i === 0 ? "Today" : getShortDay(d.dt, 0)}
                        code={d.code}
                        condition={d.condition}
                        min={d.min}
                        max={d.max}
                        selected={selectedDay === i}
                        onSelect={() => setSelectedDay(i)}
                      />
                    </div>
                  ))}
                </Carousel>
              )}
            </div>

            <div className="lg:col-span-4 xl:col-span-3">
              {panel === "rain" ? (
                <RainChart dayName={selectedDayName} data={rainData} />
              ) : (
                <AirQualityCard air={air} dayName="now" />
              )}
            </div>

            <div className="lg:col-span-8 xl:col-span-6">
              <MapSection city={city} lat={current.coord.lat} lon={current.coord.lon} />
            </div>
            <div className="lg:col-span-12 xl:col-span-3">
              <CitiesList cities={otherCities} onSelect={handleSearch} />
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function UpdatedBadge({
  updatedAt,
  loading,
  onRefresh,
}: {
  updatedAt: number | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  const [label, setLabel] = useState("Updated just now");

  useEffect(() => {
    if (!updatedAt) return;
    const compute = () => {
      const mins = Math.floor((Date.now() - updatedAt) / 60_000);
      setLabel(mins < 1 ? "Updated just now" : `Updated ${mins} min ago`);
    };
    const raf = requestAnimationFrame(compute);
    const id = setInterval(compute, 60_000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, [updatedAt]);

  if (!updatedAt) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted whitespace-nowrap">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRefresh}
        aria-label="Refresh weather now"
        title="Refresh"
        className="flex items-center justify-center w-8 h-8 rounded-full bg-surface text-muted neu-sm active:neu-inset-sm transition-shadow duration-150 cursor-pointer"
      >
        <RefreshCw size={13} className={loading ? "animate-spin" : ""} aria-hidden="true" />
      </button>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6" aria-hidden="true">
      <div className="lg:col-span-4 xl:col-span-3 h-[360px] rounded-3xl bg-well neu-inset-sm animate-pulse" />
      <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-[repeat(auto-fit,minmax(88px,1fr))] gap-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-[360px] lg:h-full rounded-3xl bg-well neu-inset-sm animate-pulse" />
        ))}
      </div>
      <div className="lg:col-span-4 xl:col-span-3 h-[320px] rounded-3xl bg-well neu-inset-sm animate-pulse" />
      <div className="lg:col-span-8 xl:col-span-6 h-[320px] rounded-3xl bg-well neu-inset-sm animate-pulse" />
      <div className="lg:col-span-12 xl:col-span-3 h-[320px] rounded-3xl bg-well neu-inset-sm animate-pulse" />
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
              OPENWEATHER_API_KEY=your_key_here
            </pre>
          </li>
          <li>Restart the dev server.</li>
        </ol>
      </div>
    </main>
  );
}
