"use client";

import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  type LucideIcon,
} from "lucide-react";

/** OpenWeatherMap condition id → icon + color, per https://openweathermap.org/weather-conditions */
function pick(code: number): [LucideIcon, string] {
  if (code >= 200 && code < 300) return [CloudLightning, "text-amber-500"];
  if (code >= 300 && code < 400) return [CloudDrizzle, "text-accent2"];
  if (code >= 500 && code < 600) return [CloudRain, "text-accent"];
  if (code >= 600 && code < 700) return [CloudSnow, "text-cyan-400"];
  if (code >= 700 && code < 800) return [CloudFog, "text-muted"];
  if (code === 800) return [Sun, "text-amber-500"];
  if (code === 801 || code === 802) return [CloudSun, "text-amber-400"];
  return [Cloud, "text-muted"];
}

interface WeatherIconProps {
  code: number;
  size?: number;
  className?: string;
}

export default function WeatherIcon({ code, size = 24, className = "" }: WeatherIconProps) {
  const [Icon, color] = pick(code);
  return <Icon size={size} strokeWidth={1.75} className={`${color} ${className}`} aria-hidden="true" />;
}
