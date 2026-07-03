"use client";

export interface RainPoint {
  label: string;
  /** Probability of precipitation, 0–100. */
  pop: number;
}

interface RainChartProps {
  dayName: string;
  data: RainPoint[];
}

export default function RainChart({ dayName, data }: RainChartProps) {
  return (
    <section aria-label={`Chance of rain, ${dayName}`} className="h-full flex flex-col p-6 rounded-3xl neu">
      <div className="text-sm font-semibold text-ink mb-4">
        Chance of rain <span className="text-muted font-medium">· {dayName}</span>
      </div>

      {data.length === 0 ? (
        <p className="text-xs text-muted flex-1 flex items-center">No hourly data for this day.</p>
      ) : (
        <div className="relative flex-1 min-h-44 rounded-2xl neu-inset-sm p-4">
          <div className="absolute left-4 top-4 bottom-[34px] flex flex-col justify-between text-[10px] text-muted">
            <span>100%</span>
            <span>50%</span>
            <span>0%</span>
          </div>

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
                    <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-muted whitespace-nowrap">
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
