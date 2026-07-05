"use client";

import type { AirQuality } from "../types/weather";
import AirQualityCard from "./AirQualityCard";
import RainChart, { type RainPoint } from "./RainChart";

type Panel = "rain" | "air";

interface ChartPanelProps {
  panel: Panel;
  onPanelChange: (panel: Panel) => void;
  dayName: string;
  data: RainPoint[];
  temps: number[];
  air: AirQuality | null;
}

/** Chart card with its own rain/air switch, so the control sits on the thing it controls. */
export default function ChartPanel({ panel, onPanelChange, dayName, data, temps, air }: ChartPanelProps) {
  const hasTemps = temps.length === data.length && temps.length > 1;

  // Fixed-width pills so the toggle's size never changes with the active state.
  const pill = (active: boolean) =>
    `w-12 text-center py-1 rounded-full text-xs cursor-pointer transition-shadow duration-150 ${
      active ? "neu-sm font-semibold text-accent" : "font-medium text-muted hover:text-ink"
    }`;

  return (
    <section aria-label="Forecast charts" className="h-full flex flex-col p-6 rounded-3xl bg-surface border border-edge/30 neu">
      {/* No wrapping: the title truncates and the toggle stays pinned, so
          switching panels never moves the control under the pointer. */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 min-w-0 truncate text-sm font-semibold text-ink">
          {panel === "rain" ? (
            <>
              Chance of rain <span className="text-muted font-medium">· {dayName}</span>
            </>
          ) : (
            <>
              Air quality <span className="text-muted font-medium">· now</span>
            </>
          )}
        </div>
        {panel === "rain" && hasTemps && (
          <div className="hidden xl:flex shrink-0 items-center text-xs text-muted whitespace-nowrap">
            <span aria-hidden="true" className="inline-block w-3 border-t-2 border-temp-trend align-middle mr-1"></span>
            {Math.round(Math.max(...temps))}° / {Math.round(Math.min(...temps))}°
          </div>
        )}
        <div className="flex shrink-0 gap-1 p-1 rounded-full neu-inset-sm" role="group" aria-label="Chart type">
          <button type="button" className={pill(panel === "rain")} onClick={() => onPanelChange("rain")}>
            Rain
          </button>
          <button type="button" className={pill(panel === "air")} onClick={() => onPanelChange("air")}>
            Air
          </button>
        </div>
      </div>
      {panel === "rain" ? <RainChart data={data} temps={temps} /> : <AirQualityCard air={air} />}
    </section>
  );
}
