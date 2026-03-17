"use client";

interface TodayCardProps {
  day: string;
  time: string;
  icon: string;
  temp: number;
  realFeel: number;
  wind: string;
  pressure: number;
  humidity: number;
  sunrise: string;
  sunset: string;
}

export default function TodayCard({
  day,
  time,
  icon,
  temp,
  realFeel,
  wind,
  pressure,
  humidity,
  sunrise,
  sunset
}: TodayCardProps) {
  return (
    <div className="relative flex flex-col gap-1.5 p-5 bg-[linear-gradient(135deg,#6366f1_0%,#a855f7_100%)] border border-[#e2e8f0] rounded-2xl min-h-[180px] text-white today-card">
      <div className="text-sm font-semibold day-label">{day}</div>
      <div className="text-[11px] text-white/80 time">{time}</div>
      <div className="absolute right-4 top-7 text-4xl w-icon-big">{icon}</div>
      <div className="text-[42px] font-bold leading-none my-1.5 temp-big">{temp}°</div>
      <div className="text-[11px] text-white/90 leading-[1.9] mt-0.5 meta">
        Real Feel {realFeel}°<br />
        Wind: {wind} km/h<br />
        Pressure: {pressure}MB<br />
        Humidity: {humidity}%
      </div>
      <div className="flex flex-wrap gap-2.5 text-[11px] text-white/80 sunrise-row">
        <span>🌅 {sunrise}</span>
        <span>🌇 {sunset}</span>
      </div>
    </div>
  );
}
