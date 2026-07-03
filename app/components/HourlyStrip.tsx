"use client";

import { Droplets } from "lucide-react";
import type { HourlyPoint } from "../types/weather";
import { fmtHour } from "../utils/weather";
import Carousel from "./Carousel";
import WeatherIcon from "./WeatherIcon";

interface HourlyStripProps {
  /** 24 hourly points (interpolated from the 3-hourly forecast). */
  hours: HourlyPoint[];
  /** City timezone offset in seconds. */
  tz: number;
}

export default function HourlyStrip({ hours, tz }: HourlyStripProps) {
  if (hours.length === 0) {
    return <p className="text-xs text-muted flex items-center h-full">No hourly data available.</p>;
  }

  return (
    <Carousel ariaLabel="Hourly forecast for the next 24 hours">
      {hours.map((h) => (
        <div
          key={h.dt}
          role="listitem"
          className="w-[84px] shrink-0 snap-start flex flex-col items-center justify-between gap-2 p-3 py-4 rounded-3xl neu-sm"
          title={`${fmtHour(h.dt, tz)}: ${Math.round(h.temp)}°, ${Math.round(h.pop * 100)}% rain`}
        >
          <div className="text-xs font-semibold text-muted whitespace-nowrap">{fmtHour(h.dt, tz)}</div>
          <div className="flex flex-col items-center gap-1.5">
            <WeatherIcon code={h.code} size={30} />
            <div className="text-lg font-bold text-ink">{Math.round(h.temp)}°</div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-accent2">
            <Droplets size={11} aria-hidden="true" />
            {Math.round(h.pop * 100)}%
          </div>
        </div>
      ))}
    </Carousel>
  );
}
