"use client";

import { Sunrise, Sunset, TriangleAlert } from "lucide-react";
import { heatWarning, uvCategory } from "../utils/weather";
import WeatherIcon from "./WeatherIcon";

interface TodayCardProps {
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
  sunrise: string;
  sunset: string;
}

export default function TodayCard({
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
  sunrise,
  sunset,
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
      className="h-full flex flex-col gap-4 p-6 xl:p-7 rounded-3xl neu"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-base font-semibold text-ink">{day}</div>
          <div className="text-xs text-muted mt-0.5">{time}</div>
        </div>
        <WeatherIcon code={code} size={52} />
      </div>

      <div>
        <div className="text-6xl xl:text-7xl font-bold leading-none text-gradient">{temp}°</div>
        <div className="text-sm text-muted capitalize mt-2">{condition}</div>
        {heat && (
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold" style={{ color: heat.color }}>
            <TriangleAlert size={13} aria-hidden="true" />
            Heat: {heat.label.toLowerCase()} — feels like {realFeel}°
          </div>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3 mt-auto">
        {details.map((d) => (
          <div key={d.label} className="rounded-2xl neu-inset-sm px-3 py-2.5 text-center">
            <dt className="text-xs uppercase tracking-wide text-muted">{d.label}</dt>
            <dd className="text-sm font-semibold text-ink mt-0.5">{d.value}</dd>
          </div>
        ))}
        {uvInfo && (
          <div className="col-span-2 rounded-2xl neu-inset-sm px-3 py-2.5 text-center">
            <dt className="text-xs uppercase tracking-wide text-muted">UV index</dt>
            <dd className="text-sm font-semibold text-ink mt-0.5 flex items-center justify-center gap-1.5">
              <span aria-hidden="true" className="inline-block w-2 h-2 rounded-full" style={{ background: uvInfo.color }} />
              {Math.round(uv!)} · {uvInfo.label}
            </dd>
          </div>
        )}
      </dl>

      <div className="flex justify-between gap-2 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <Sunrise size={15} className="text-amber-500" aria-hidden="true" /> {sunrise}
        </span>
        <span className="flex items-center gap-1.5">
          <Sunset size={15} className="text-orange-400" aria-hidden="true" /> {sunset}
        </span>
      </div>
    </section>
  );
}
