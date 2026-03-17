"use client";

import { useState, useEffect, useCallback } from "react";
import TopBar from "./components/TopBar";
import TodayCard from "./components/TodayCard";
import ForecastCard from "./components/ForecastCard";
import RainChart from "./components/RainChart";
import MapSection from "./components/MapSection";
import CitiesList from "./components/CitiesList";
import { iconFromCode, fmtTime, getDayName, getShortDay } from "./utils/weather";

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const FIXED_CITIES = [
  { name: "California", country: "US" },
  { name: "Beijing", country: "CN" },
  { name: "Jerusalem", country: "IL" },
];

export default function Home() {
  const [city, setCity] = useState("Seattle");
  const [inputCity, setInputCity] = useState("Seattle");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [otherCities, setOtherCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = useCallback(async (searchCity: string) => {
    setLoading(true);
    setError(null);
    try {
      // Current Weather
      const curRes = await fetch(`${BASE_URL}/weather?q=${searchCity}&units=metric&appid=${API_KEY}`);
      if (!curRes.ok) throw new Error("City not found");
      const curData = await curRes.json();
      setWeatherData(curData);
      setCity(curData.name);

      // 5-day Forecast (Free tier doesn't have 7-day, using 5-day / 3-hour chunks)
      const forRes = await fetch(`${BASE_URL}/forecast?q=${searchCity}&units=metric&appid=${API_KEY}`);
      if (forRes.ok) {
        const forData = await forRes.json();
        // Group by day (approximate daily forecast from 3-hourly data)
        const daily = forData.list.filter((_: any, i: number) => i % 8 === 0).slice(1, 7);
        setForecastData(daily);
      }

      // Fetch other cities in parallel
      const others = await Promise.all(
        FIXED_CITIES.map(async (f) => {
          const r = await fetch(`${BASE_URL}/weather?q=${f.name}&units=metric&appid=${API_KEY}`);
          if (r.ok) {
            const d = await r.json();
            return {
              name: f.name,
              country: f.country,
              condition: d.weather[0].main,
              icon: iconFromCode(d.weather[0].id),
              temp: Math.round(d.main.temp),
            };
          }
          return null;
        })
      );
      setOtherCities(others.filter(Boolean));
    } catch (err: any) {
      setError(err.message || "Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeatherData(city);
  }, [fetchWeatherData]);

  const handleSearch = (newCity: string) => {
    if (newCity.trim()) {
      fetchWeatherData(newCity);
    }
  };

  if (loading && !weatherData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#7c3aed] rounded-full animate-spin"></div>
        <p className="mt-4 text-[#64748b] text-sm font-medium">Fetching weather data...</p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-5 md:p-8">
      <TopBar city={city} onSearch={handleSearch} onCityInput={setInputCity} inputCity={inputCity} />

      <div className="flex items-center gap-1.5 mb-5 overflow-x-auto whitespace-nowrap">
        <div className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-[#64748b] cursor-pointer">Today</div>
        <div className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-[#64748b] cursor-pointer">Tomorrow</div>
        <div className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-[#0f172a] cursor-pointer">Next 5 days</div>
        <div className="ml-auto flex gap-1 bg-white border border-[#e2e8f0] p-1 rounded-lg">
          <button className="px-3.5 py-1.5 rounded-md text-[12px] font-medium bg-[#7c3aed] text-white">Forecast</button>
          <button className="px-3.5 py-1.5 rounded-md text-[12px] font-medium text-[#64748b]">Air quality</button>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center p-10 bg-red-50 border border-red-200 rounded-2xl text-red-800">
          <strong className="text-lg">⚠️ Could not load weather</strong>
          <span className="mt-1 text-sm">{error}</span>
          <button onClick={() => fetchWeatherData(inputCity)} className="mt-4 bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">Try again</button>
        </div>
      ) : weatherData && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-5">
            {/* Forecast Strip */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] lg:grid-cols-[220px_repeat(5,1fr)] gap-2.5">
              <TodayCard
                day={getDayName(weatherData.dt, weatherData.timezone)}
                time={fmtTime(weatherData.dt, weatherData.timezone)}
                icon={iconFromCode(weatherData.weather[0].id)}
                temp={Math.round(weatherData.main.temp)}
                realFeel={Math.round(weatherData.main.feels_like)}
                wind={`${weatherData.wind.speed} km/h`}
                pressure={weatherData.main.pressure}
                humidity={weatherData.main.humidity}
                sunrise={fmtTime(weatherData.sys.sunrise, weatherData.timezone)}
                sunset={fmtTime(weatherData.sys.sunset, weatherData.timezone)}
              />
              {forecastData.map((d, i) => (
                <ForecastCard
                  key={i}
                  dayName={getShortDay(d.dt, weatherData.timezone)}
                  icon={iconFromCode(d.weather[0].id)}
                  temp={Math.round(d.main.temp)}
                />
              ))}
            </div>

            {/* Rain Chart (Simulated with real chance if available, or static for design) */}
            <RainChart data={[
              { time: "10AM", height: 55 },
              { time: "11AM", height: 75, active: true },
              { time: "12AM", height: 100, active: true },
              { time: "01PM", height: 110, active: true },
              { time: "02PM", height: 95, active: true },
              { time: "03PM", height: 120, active: true },
            ]} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
            <MapSection city={city} />
            <CitiesList cities={otherCities} />
          </div>
        </div>
      )}
    </main>
  );
}
