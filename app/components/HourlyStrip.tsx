"use client";

import { Droplets } from "lucide-react";
import type { ForecastSlot } from "../types/weather";
import { fmtHour } from "../utils/weather";
import WeatherIcon from "./WeatherIcon";

interface HourlyStripProps {
  /** Next ~24h of 3-hour forecast slots. */
  slots: ForecastSlot[];
  /** City timezone offset in seconds. */
  tz: number;
}

export default function HourlyStrip({ slots, tz }: HourlyStripProps) {
  if (slots.length === 0) {
    return <p className="text-xs text-muted flex items-center h-full">No hourly data available.</p>;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-3 xl:gap-4 h-full" role="list" aria-label="Hourly forecast">
      {slots.map((s) => (
        <div
          key={s.dt}
          role="listitem"
          className="flex flex-col items-center justify-between gap-2 p-3 py-4 rounded-3xl neu-sm"
          title={`${fmtHour(s.dt, tz)}: ${s.weather[0].description}, ${Math.round(s.main.temp)}°, ${Math.round(s.pop * 100)}% rain`}
        >
          <div className="text-xs font-semibold text-muted whitespace-nowrap">{fmtHour(s.dt, tz)}</div>
          <div className="flex flex-col items-center gap-1.5">
            <WeatherIcon code={s.weather[0].id} size={32} />
            <div className="text-lg font-bold text-ink">{Math.round(s.main.temp)}°</div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-accent2">
            <Droplets size={11} aria-hidden="true" />
            {Math.round(s.pop * 100)}%
          </div>
        </div>
      ))}
    </div>
  );
}
