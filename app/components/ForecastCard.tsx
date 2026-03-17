"use client";

interface ForecastCardProps {
  dayName: string;
  icon: string;
  temp: number;
}

export default function ForecastCard({ dayName, icon, temp }: ForecastCardProps) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-white border border-[#e2e8f0] rounded-[14px] day-card">
      <div className="text-xs font-medium text-[#64748b] day-name">{dayName}</div>
      <div className="text-3xl w-icon">{icon}</div>
      <div className="text-xl font-bold temp">{temp}°</div>
    </div>
  );
}
