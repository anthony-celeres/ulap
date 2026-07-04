"use client";

import { ChevronRight } from "lucide-react";
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

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1 gap-4">
        {cities.map((city) => (
          <button
            key={city.name}
            type="button"
            onClick={() => onSelect(city.name)}
            title={`Show weather for ${city.name}`}
            className="w-full flex items-center justify-between gap-3 py-3 px-4 rounded-3xl border border-edge hover:border-accent neu-sm active:neu-inset-sm cursor-pointer text-left transition-shadow duration-150"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs uppercase tracking-wide text-muted truncate">{city.country}</span>
              <span className="text-sm font-semibold text-ink truncate">{city.name}</span>
              <span className="text-xs text-muted truncate">{city.condition}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <WeatherIcon code={city.code} size={30} className="shrink-0" />
              <div className="text-xl font-bold text-ink shrink-0">{city.temp}°</div>
              <ChevronRight size={16} className="text-muted shrink-0" aria-hidden="true" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
