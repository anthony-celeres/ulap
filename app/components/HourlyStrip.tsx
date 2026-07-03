"use client";

import { Droplets } from "lucide-react";
import type { HourlyPoint } from "../types/weather";
import { fmtHour } from "../utils/weather";
import Carousel from "./Carousel";
import WeatherIcon from "./WeatherIcon";

interface HourlyStripProps {
  /** Today's 24 hours, midnight to 11 PM. */
  hours: HourlyPoint[];
  /** Marks the current hour's tile. */
  nowDt?: number;
}

function HourTile({ point, now }: { point: HourlyPoint; now: boolean }) {
  return (
    <div
      role="listitem"
      className={`flex-1 w-[88px] flex flex-col items-center justify-center gap-1.5 p-2 rounded-3xl ${
        now ? "neu-inset" : "neu-sm"
      }`}
      title={`${fmtHour(point.dt, 0)}: ${Math.round(point.temp)}°, ${Math.round(point.pop)}% rain`}
    >
      <div className={`text-[11px] font-semibold whitespace-nowrap ${now ? "text-accent" : "text-muted"}`}>
        {fmtHour(point.dt, 0)}
      </div>
      <WeatherIcon code={point.code} size={26} />
      <div className="text-base font-bold text-ink leading-none">{Math.round(point.temp)}°</div>
      <div className="flex items-center gap-1 text-[10px] font-medium text-accent2">
        <Droplets size={10} aria-hidden="true" />
        {Math.round(point.pop)}%
      </div>
    </div>
  );
}

/**
 * Today's hours in two clock-aligned rows: 12 AM–11 AM on top,
 * 12 PM–11 PM below, scrolling together column by column.
 */
export default function HourlyStrip({ hours, nowDt }: HourlyStripProps) {
  if (hours.length < 24) {
    return <p className="text-xs text-muted flex items-center h-full">No hourly data available.</p>;
  }

  const isNow = (p: HourlyPoint) =>
    nowDt !== undefined && nowDt >= p.dt && nowDt < p.dt + 3600;

  return (
    <Carousel ariaLabel="Today's hourly forecast, midnight to 11 PM">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={hours[i].dt} className="shrink-0 snap-start h-full flex flex-col gap-3 xl:gap-4">
          <HourTile point={hours[i]} now={isNow(hours[i])} />
          <HourTile point={hours[i + 12]} now={isNow(hours[i + 12])} />
        </div>
      ))}
    </Carousel>
  );
}
