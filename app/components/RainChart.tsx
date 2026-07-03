"use client";

export interface RainPoint {
  label: string;
  /** Probability of precipitation, 0–100. */
  pop: number;
}

interface RainChartProps {
  dayName: string;
  data: RainPoint[];
  /** Temperatures aligned with `data`, drawn as a trend line. */
  temps?: number[];
}

export default function RainChart({ dayName, data, temps }: RainChartProps) {
  const hasTemps = !!temps && temps.length === data.length && temps.length > 1;
  let tempPath = "";
  let tempMin = 0;
  let tempMax = 0;
  if (hasTemps) {
    tempMin = Math.min(...temps);
    tempMax = Math.max(...temps);
    const span = Math.max(tempMax - tempMin, 1);
    tempPath = `M${temps
      .map((t, i) => `${(i / (temps.length - 1)) * 100},${90 - ((t - tempMin) / span) * 80}`)
      .join(" L")}`;
  }

  return (
    <section aria-label={`Forecast chart, ${dayName}`} className="h-full flex flex-col p-6 rounded-3xl neu">
      <div className="flex items-baseline justify-between gap-2 mb-4">
        <div className="text-sm font-semibold text-ink">
          Chance of rain <span className="text-muted font-medium">· {dayName}</span>
        </div>
        {hasTemps && (
          <div className="text-xs text-muted whitespace-nowrap">
            <span aria-hidden="true" className="inline-block w-3 border-t-2 border-accent align-middle mr-1"></span>
            {Math.round(tempMax)}° / {Math.round(tempMin)}°
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <p className="text-xs text-muted flex-1 flex items-center">No hourly data for this day.</p>
      ) : (
        <div className="relative flex-1 min-h-44 rounded-2xl neu-inset-sm p-4">
          <div className="absolute left-4 top-4 bottom-[34px] flex flex-col justify-between text-xs text-muted">
            <span>100%</span>
            <span>50%</span>
            <span>0%</span>
          </div>

          {hasTemps && (
            <svg
              className="absolute top-4 bottom-[38px] left-12 right-4 w-[calc(100%-4rem)] h-[calc(100%-3.4rem)] pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d={tempPath}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                opacity={0.85}
              />
            </svg>
          )}
          <div className="ml-8 flex gap-1 h-full">
            {data.map((item, idx) => (
              <div key={item.label} className="flex-1 min-w-0 flex flex-col">
                <div className="relative flex-1">
                  <div
                    role="img"
                    aria-label={`${item.label}: ${item.pop}% chance of rain`}
                    title={`${item.pop}%`}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 rounded-full bg-hero-grad transition-[height] duration-150"
                    style={{ height: `${Math.max(item.pop, 4)}%`, opacity: item.pop >= 40 ? 1 : 0.35 }}
                  ></div>
                </div>
                {/* labels overflow their narrow columns, so render every other one */}
                <div className="relative h-[18px]">
                  {idx % 2 === 0 && (
                    <span className="absolute top-1 left-1/2 -translate-x-1/2 text-xs text-muted whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
