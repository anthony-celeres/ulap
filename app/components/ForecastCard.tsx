"use client";

import WeatherIcon from "./WeatherIcon";

interface ForecastCardProps {
  dayName: string;
  code: number;
  condition: string;
  min: number;
  max: number;
  selected: boolean;
  onSelect: () => void;
}

export default function ForecastCard({ dayName, code, condition, min, max, selected, onSelect }: ForecastCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      title={`${dayName}: ${condition}, high ${max}°, low ${min}°`}
      className={`w-full h-full flex flex-col items-center justify-between gap-3 p-4 py-5 rounded-3xl cursor-pointer transition-shadow duration-150 ${
        selected ? "neu-inset" : "neu-sm"
      }`}
    >
      <div className={`text-xs font-semibold ${selected ? "text-accent" : "text-muted"}`}>{dayName}</div>
      <div className="flex flex-col items-center gap-2.5">
        <WeatherIcon code={code} size={38} />
        <div className="text-[11px] text-muted capitalize text-center leading-tight">{condition}</div>
      </div>
      <div className="text-lg font-bold text-ink">
        {max}°<span className="text-sm font-medium text-muted"> / {min}°</span>
      </div>
    </button>
  );
}
