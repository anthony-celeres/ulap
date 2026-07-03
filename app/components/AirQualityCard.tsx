"use client";

import type { AirQuality } from "../types/weather";
import { describeAqi } from "../utils/weather";

const AQI_COLORS = ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444"];

/** Rough "full bar" scales (µg/m³) so pollutant bars are comparable at a glance. */
const POLLUTANTS: { key: keyof AirQuality["components"]; label: string; scale: number }[] = [
  { key: "pm2_5", label: "PM2.5", scale: 75 },
  { key: "pm10", label: "PM10", scale: 150 },
  { key: "o3", label: "O₃", scale: 180 },
  { key: "no2", label: "NO₂", scale: 200 },
];

export default function AirQualityCard({ air, dayName }: { air: AirQuality | null; dayName: string }) {
  if (!air) {
    return (
      <section aria-label="Air quality" className="h-full flex flex-col p-6 rounded-3xl neu">
        <div className="text-sm font-semibold text-ink mb-4">Air quality</div>
        <p className="text-xs text-muted flex-1 flex items-center">Air quality data is unavailable.</p>
      </section>
    );
  }

  const color = AQI_COLORS[air.aqi - 1] ?? AQI_COLORS[2];

  return (
    <section aria-label={`Air quality: ${describeAqi(air.aqi)}`} className="h-full flex flex-col p-6 rounded-3xl neu">
      <div className="text-sm font-semibold text-ink mb-4">
        Air quality <span className="text-muted font-medium">· {dayName}</span>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <span
          className="inline-flex items-center justify-center w-12 h-12 rounded-full text-white text-base font-bold neu-sm"
          style={{ background: color }}
        >
          {air.aqi}
        </span>
        <div>
          <div className="text-base font-semibold text-ink">{describeAqi(air.aqi)}</div>
          <div className="text-[11px] text-muted">Air Quality Index (1–5)</div>
        </div>
      </div>

      <dl className="flex flex-col gap-3.5">
        {POLLUTANTS.map(({ key, label, scale }) => {
          const value = air.components[key];
          const pct = Math.min((value / scale) * 100, 100);
          return (
            <div key={key} className="grid grid-cols-[46px_1fr_52px] items-center gap-3 text-[11px]">
              <dt className="text-muted font-medium">{label}</dt>
              <dd className="h-2.5 rounded-full neu-inset-sm overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }}></div>
              </dd>
              <dd className="text-right text-ink font-semibold">{value.toFixed(1)}</dd>
            </div>
          );
        })}
      </dl>
      <p className="text-[10px] text-muted mt-auto pt-3">Pollutant concentrations in µg/m³.</p>
    </section>
  );
}
