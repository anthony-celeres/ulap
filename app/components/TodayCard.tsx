"use client";

import { Clock, Info, MapPin, TriangleAlert } from "lucide-react";
import { heatWarning, uvCategory } from "../utils/weather";
import WeatherIcon from "./WeatherIcon";

interface TodayCardProps {
  /** Searched place name, e.g. a barangay. */
  location: string;
  /** Rest of the address — municipality/city, province. */
  locationDetail?: string;
  day: string;
  time: string;
  code: number;
  condition: string;
  temp: number;
  realFeel: number;
  windKmh: number;
  pressure: number;
  humidity: number;
  /** Current UV index, when the forecast provides it. */
  uv?: number;
  /** Local time the shown reading is from, e.g. "12:30 PM". */
  asOf?: string;
}

export default function TodayCard({
  location,
  locationDetail,
  day,
  time,
  code,
  condition,
  temp,
  realFeel,
  windKmh,
  pressure,
  humidity,
  uv,
  asOf,
}: TodayCardProps) {
  const heat = heatWarning(realFeel);
  const uvInfo = uv !== undefined ? uvCategory(uv) : null;

  const details = [
    { label: "Real feel", value: `${realFeel}°` },
    { label: "Wind", value: `${windKmh} km/h` },
    { label: "Humidity", value: `${humidity}%` },
    { label: "Pressure", value: `${pressure} hPa` },
  ];

  return (
    <section
      aria-label={`Current weather: ${condition}, ${temp} degrees`}
      className="h-full flex flex-col gap-4 p-6 xl:p-7 rounded-3xl bg-surface border border-edge/30 neu"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-base font-semibold text-ink">
            <MapPin size={15} className="text-accent shrink-0" aria-hidden="true" />
            <span className="truncate">{location}</span>
          </div>
          {locationDetail && <div className="text-xs text-muted mt-0.5 truncate">{locationDetail}</div>}
          <div className="text-xs text-muted mt-1">
            {day} · {time}
          </div>
        </div>
        <WeatherIcon code={code} size={52} className="shrink-0" />
      </div>

      <div>
        <div className="text-6xl xl:text-7xl font-bold leading-none text-gradient">{temp}°</div>
        <div className="text-sm text-muted capitalize mt-2">{condition}</div>
        {heat && (
          <div
            className="flex items-center gap-2 mt-3 px-4 py-2.5 rounded-2xl neu-inset-sm text-xs font-semibold"
            style={{
              color: heat.color,
              backgroundColor: `${heat.color}0c`, // ~5% opacity for a soft tint
            }}
          >
            <TriangleAlert size={14} className="shrink-0" aria-hidden="true" />
            <span>
              Heat Index: {heat.label}
            </span>
          </div>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3 mt-auto">
        {details.map((d) => (
          <div key={d.label} className="rounded-2xl bg-well/30 neu-inset-sm px-3 py-2.5 text-center">
            <dt className="text-[10px] uppercase tracking-wider text-muted font-medium">{d.label}</dt>
            <dd className="text-sm font-bold text-ink mt-0.5">{d.value}</dd>
          </div>
        ))}
        {uvInfo && (
          <div className="col-span-2 rounded-2xl bg-well/30 neu-inset-sm px-3 py-2.5 text-center">
            <dt className="text-[10px] uppercase tracking-wider text-muted font-medium">UV index</dt>
            <dd className="text-sm font-bold text-ink mt-0.5 flex items-center justify-center gap-1.5">
              <span aria-hidden="true" className="inline-block w-2 h-2 rounded-full" style={{ background: uvInfo.color }} />
              {Math.round(uv!)} · {uvInfo.label}
            </dd>
          </div>
        )}
      </dl>



      {asOf && (
        <div className="flex items-center gap-1.5 pt-3.5 text-xs text-muted border-t border-edge/25">
          <Clock size={13} className="shrink-0" aria-hidden="true" />
          <span>As of {asOf}</span>
          <span
            tabIndex={0}
            role="note"
            aria-label="Live forecast conditions refresh about every 15 minutes, so the reading can stay the same between refreshes."
            title="Live forecast conditions refresh about every 15 minutes, so the reading can stay the same between refreshes."
            className="inline-flex items-center cursor-help text-muted/80 outline-none"
          >
            <Info size={13} aria-hidden="true" />
          </span>
        </div>
      )}
    </section>
  );
}
