"use client";

import { Droplets } from "lucide-react";
import type { HourlyPoint } from "../types/weather";
import { fmtHour } from "../utils/weather";
import Carousel from "./Carousel";
import WeatherIcon from "./WeatherIcon";

interface HourlyStripProps {
  /** Today's 24 hours, midnight to 11 PM. */
  hours: HourlyPoint[];
  /** Marks the current hour's cell. */
  nowDt?: number;
}

function HourCell({ point, now, past }: { point: HourlyPoint; now: boolean; past: boolean }) {
  const hourNum = new Date(point.dt * 1000).getUTCHours() % 12 || 12;
  return (
    <div
      className={`flex-1 max-h-44 flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2.5 border transition-all duration-150 ${
        now ? "bg-well/30 border-edge/15 neu-inset-sm font-semibold" : "border-transparent"
      } ${past ? "opacity-45" : ""}`}
      title={`${fmtHour(point.dt, 0)}: ${Math.round(point.temp)}°, ${Math.round(point.pop)}% rain`}
    >
      <span className={`text-[10px] uppercase font-semibold ${now ? "text-accent" : "text-muted"}`}>{hourNum}</span>
      <WeatherIcon code={point.code} size={22} className="my-0.5 shrink-0" />
      <span className="text-sm font-semibold text-ink leading-none">{Math.round(point.temp)}°</span>
      {/* Rain chance only when meaningful; invisible keeps cells aligned. */}
      <span
        className={`flex items-center gap-0.5 text-[10px] font-semibold text-accent2 ${point.pop < 10 ? "invisible" : ""}`}
      >
        <Droplets size={9} aria-hidden="true" />
        {Math.round(point.pop)}%
      </span>
    </div>
  );
}

/**
 * Today's hours as one quiet panel: borderless cells in two clock-aligned
 * rows (12 AM–11 AM over 12 PM–11 PM) with AM/PM labeled once at the left.
 * Columns stretch to fill wide screens and scroll on narrow ones.
 */
export default function HourlyStrip({ hours, nowDt }: HourlyStripProps) {
  if (hours.length < 24) {
    return <p className="text-xs text-muted flex items-center h-full">No hourly data available.</p>;
  }

  const isNow = (p: HourlyPoint) => nowDt !== undefined && nowDt >= p.dt && nowDt < p.dt + 3600;
  const isPast = (p: HourlyPoint) => nowDt !== undefined && p.dt + 3600 <= nowDt;

  // Bring the current hour's column into view (minus one column of context).
  // Child 0 is the sticky AM/PM label column, so hour columns start at 1.
  const nowHour = nowDt !== undefined ? new Date(nowDt * 1000).getUTCHours() : 0;
  const scrollToIndex = Math.max(1, nowHour % 12);

  return (
    <section aria-label="Today's hourly forecast, midnight to 11 PM" className="relative overflow-hidden h-full rounded-3xl bg-surface border border-edge/30 neu py-4 pr-4 pl-0 xl:py-5 xl:pr-5 xl:pl-0">
      <Carousel ariaLabel="Hours, midnight to 11 PM" scrollToIndex={scrollToIndex} scrollPadding={54}>
        {/* Sticky, solid mask covering the left edge padding so hours never leak behind the left side */}
        <div
          aria-hidden="true"
          className="sticky left-0 z-10 shrink-0 pl-4 xl:pl-5 w-[52px] xl:w-[56px] bg-surface h-full flex flex-col justify-center gap-1.5 text-center text-[10px] font-bold text-muted border-r border-edge/10 pr-1.5"
        >
          <span className="flex-1 max-h-44 flex items-center justify-center">AM</span>
          <span className="flex-1 max-h-44 flex items-center justify-center">PM</span>
        </div>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={hours[i].dt} className="flex-1 min-w-16 shrink-0 snap-start h-full flex flex-col justify-center gap-1.5">
            <HourCell point={hours[i]} now={isNow(hours[i])} past={isPast(hours[i])} />
            <HourCell point={hours[i + 12]} now={isNow(hours[i + 12])} past={isPast(hours[i + 12])} />
          </div>
        ))}
      </Carousel>
    </section>
  );
}
