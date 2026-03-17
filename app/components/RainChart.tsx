"use client";

interface RainChartProps {
  data: { time: string; height: number; active?: boolean }[];
}

export default function RainChart({ data }: RainChartProps) {
  return (
    <div className="rain-section">
      <div className="text-sm font-semibold mb-3.5 section-title">Chance of rain</div>
      <div className="relative h-40 rain-chart">
        <div className="absolute left-0 top-0 bottom-[22px] flex flex-col justify-between text-[11px] text-[#64748b] rain-labels-y">
          <span>Rainy</span>
          <span>Sunny</span>
          <span>Heavy</span>
        </div>
        <div className="absolute top-1/4 left-[50px] right-0 border-t border-dashed border-[#e2e8f0]"></div>
        <div className="absolute top-[55%] left-[50px] right-0 border-t border-dashed border-[#e2e8f0]"></div>
        
        <div className="ml-[50px] flex items-end gap-2 h-[138px] rain-bars-wrap">
          {data.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1 rain-bar-col">
              <div 
                className={`w-[22px] rounded-t-sm transition-[height] duration-300 rain-bar ${item.active ? 'bg-[#3b82f6]' : 'bg-[#cbd5e1]'}`} 
                style={{ height: `${item.height}px` }}
              ></div>
              <span className="text-[10px] text-[#64748b] rain-time">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
