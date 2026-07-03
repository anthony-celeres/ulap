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

  const pill = (active: boolean) =>
    `px-3 py-1 rounded-full text-xs cursor-pointer transition-shadow duration-150 ${
      active ? "neu-sm font-semibold text-accent" : "font-medium text-muted hover:text-ink"
    }`;

  return (
    <section aria-label="Forecast charts" className="h-full flex flex-col p-6 rounded-3xl neu">
      <div className="flex items-center justify-between gap-x-3 gap-y-2 flex-wrap mb-4">
        <div className="text-sm font-semibold text-ink">
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
        <div className="flex items-center gap-3">
          {panel === "rain" && hasTemps && (
            <div className="hidden sm:flex items-center text-xs text-muted whitespace-nowrap">
              <span aria-hidden="true" className="inline-block w-3 border-t-2 border-accent align-middle mr-1"></span>
              {Math.round(Math.max(...temps))}° / {Math.round(Math.min(...temps))}°
            </div>
          )}
          <div className="flex gap-1 p-1 rounded-full neu-inset-sm" role="group" aria-label="Chart type">
            <button type="button" className={pill(panel === "rain")} onClick={() => onPanelChange("rain")}>
              Rain
            </button>
            <button type="button" className={pill(panel === "air")} onClick={() => onPanelChange("air")}>
              Air
            </button>
          </div>
        </div>
      </div>
      {panel === "rain" ? <RainChart data={data} temps={temps} /> : <AirQualityCard air={air} />}
    </section>
  );
}
