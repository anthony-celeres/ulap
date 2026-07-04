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

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-1 gap-4">
        {cities.map((city) => (
          <button
            key={city.name}
            type="button"
            onClick={() => onSelect(city.name)}
            title={`Show weather for ${city.name}`}
            className="flex items-center justify-between py-3 px-5 rounded-3xl border border-edge hover:border-accent neu-sm active:neu-inset-sm cursor-pointer text-left transition-shadow duration-150"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-xs uppercase tracking-wide text-muted">{city.country}</span>
              <span className="text-sm font-semibold text-ink">{city.name}</span>
              <span className="text-xs text-muted">{city.condition}</span>
            </div>
            <div className="flex items-center gap-3">
              <WeatherIcon code={city.code} size={30} />
              <div className="text-xl font-bold text-ink">{city.temp}°</div>
              <ChevronRight size={16} className="text-muted" aria-hidden="true" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
