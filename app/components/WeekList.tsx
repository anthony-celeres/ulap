"use client";

import { Droplets } from "lucide-react";
import type { DailyForecast } from "../types/weather";
import { getShortDay } from "../utils/weather";
import WeatherIcon from "./WeatherIcon";

interface WeekListProps {
  days: DailyForecast[];
  /** Max rain probability (0–100) per day, aligned with `days`. */
  popByDay: number[];
  selectedDay: number;
  onSelect: (index: number) => void;
}

/**
 * Google Weather-style day list: one compact row per day. Rows reflow at any
 * width — condition text appears from md, the temperature-range bar from sm.
 */
export default function WeekList({ days, popByDay, selectedDay, onSelect }: WeekListProps) {
  const weekMin = Math.min(...days.map((d) => d.min));
  const weekMax = Math.max(...days.map((d) => d.max));
  const span = Math.max(weekMax - weekMin, 1);

  return (
    <div className="h-full flex flex-col gap-3" role="group" aria-label="Daily forecast">
      {days.map((d, i) => {
        const selected = i === selectedDay;
        return (
          <button
            key={d.key}
            type="button"
            onClick={() => onSelect(i)}
            aria-pressed={selected}
            title={`${d.condition}, high ${d.max}°, low ${d.min}°, ${Math.round(popByDay[i] ?? 0)}% rain`}
            className={`w-full flex-1 min-h-[52px] flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border cursor-pointer transition-shadow duration-150 ${
              selected ? "border-accent neu-inset" : "border-edge neu-sm hover:border-accent"
            }`}
          >
            <span className={`w-14 shrink-0 text-left text-sm font-semibold ${selected ? "text-accent" : "text-ink"}`}>
              {i === 0 ? "Today" : getShortDay(d.dt, 0)}
            </span>
            <WeatherIcon code={d.code} size={24} className="shrink-0" />
            <span className="hidden md:block flex-1 min-w-0 text-left text-xs text-muted capitalize truncate">
              {d.condition}
            </span>
            <span className="ml-auto flex items-center gap-3 sm:gap-4">
              <span className="flex items-center justify-end gap-1 w-12 shrink-0 text-xs font-medium text-accent2">
                <Droplets size={11} aria-hidden="true" />
                {Math.round(popByDay[i] ?? 0)}%
              </span>
              {/* Where this day's min–max sits within the week's range. */}
              <span aria-hidden="true" className="hidden sm:block relative w-24 lg:w-36 h-2 rounded-full neu-inset-sm shrink-0">
                <span
                  className="absolute top-0 h-full rounded-full bg-hero-grad"
                  style={{
                    left: `${((d.min - weekMin) / span) * 100}%`,
                    width: `${Math.max(((d.max - d.min) / span) * 100, 8)}%`,
                  }}
                />
              </span>
              <span className="w-18 shrink-0 text-right text-sm whitespace-nowrap">
                <span className="font-bold text-ink">{d.max}°</span>
                <span className="text-muted"> / {d.min}°</span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
