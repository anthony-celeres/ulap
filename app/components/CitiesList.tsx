"use client";

import type { CitySummary } from "../types/weather";
import WeatherIcon from "./WeatherIcon";

interface CitiesListProps {
  cities: CitySummary[];
  onSelect: (city: string) => void;
}

export default function CitiesList({ cities, onSelect }: CitiesListProps) {
  return (
    <section aria-label="Around the Philippines" className="h-full flex flex-col">
      <h3 className="text-sm font-semibold text-ink mb-4">Around the Philippines</h3>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
        {cities.map((city) => (
          <button
            key={city.name}
            type="button"
            onClick={() => onSelect(city.name)}
            title={`Show weather for ${city.name}`}
            className="flex items-center justify-between py-3 px-5 rounded-3xl neu-sm active:neu-inset-sm cursor-pointer text-left transition-shadow duration-150"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-wide text-muted">{city.country}</span>
              <span className="text-sm font-semibold text-ink">{city.name}</span>
              <span className="text-[11px] text-muted">{city.condition}</span>
            </div>
            <div className="flex items-center gap-3">
              <WeatherIcon code={city.code} size={30} />
              <div className="text-xl font-bold text-ink">{city.temp}°</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
