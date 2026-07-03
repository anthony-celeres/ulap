import type { DailyForecast, HourlyPoint, OpenMeteoForecast } from "../types/weather";

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Shift a UTC timestamp into the city's local time (offsets in seconds). */
function toLocal(unixUTC: number, offsetSec: number) {
  return new Date((unixUTC + offsetSec) * 1000);
}

export function fmtTime(unixUTC: number, offsetSec: number) {
  const d = toLocal(unixUTC, offsetSec);
  let h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

/** Compact hour label for chart axes, e.g. "2 PM". */
export function fmtHour(unixUTC: number, offsetSec: number) {
  const d = toLocal(unixUTC, offsetSec);
  const h = d.getUTCHours();
  return `${h % 12 || 12} ${h >= 12 ? "PM" : "AM"}`;
}

export function getDayName(unixUTC: number, offsetSec: number) {
  return DAYS[toLocal(unixUTC, offsetSec).getUTCDay()];
}

export function getShortDay(unixUTC: number, offsetSec: number) {
  return SHORT[toLocal(unixUTC, offsetSec).getUTCDay()];
}

/** Wind speeds arrive in m/s when units=metric. */
export function msToKmh(ms: number) {
  return Math.round(ms * 3.6);
}

export const AQI_LEVELS = ["Good", "Fair", "Moderate", "Poor", "Very Poor"] as const;

export function describeAqi(aqi: number) {
  return AQI_LEVELS[aqi - 1] ?? "Unknown";
}

/**
 * WMO weather codes (Open-Meteo) mapped to the OpenWeatherMap-style ids that
 * WeatherIcon understands, plus a human label.
 * https://open-meteo.com/en/docs#weather_code
 */
const WMO: Record<number, [owmCode: number, label: string]> = {
  0: [800, "Clear sky"],
  1: [801, "Mainly clear"],
  2: [802, "Partly cloudy"],
  3: [804, "Overcast"],
  45: [741, "Fog"],
  48: [741, "Rime fog"],
  51: [300, "Light drizzle"],
  53: [301, "Drizzle"],
  55: [302, "Heavy drizzle"],
  56: [311, "Freezing drizzle"],
  57: [312, "Freezing drizzle"],
  61: [500, "Light rain"],
  63: [501, "Rain"],
  65: [502, "Heavy rain"],
  66: [511, "Freezing rain"],
  67: [511, "Freezing rain"],
  71: [600, "Light snow"],
  73: [601, "Snow"],
  75: [602, "Heavy snow"],
  77: [601, "Snow grains"],
  80: [520, "Light showers"],
  81: [521, "Showers"],
  82: [522, "Heavy showers"],
  85: [620, "Snow showers"],
  86: [621, "Snow showers"],
  95: [200, "Thunderstorm"],
  96: [201, "Thunderstorm, hail"],
  99: [202, "Thunderstorm, hail"],
};

export function wmoToIconCode(wmo: number) {
  return WMO[wmo]?.[0] ?? 804;
}

export function wmoDescription(wmo: number) {
  return WMO[wmo]?.[1] ?? "Cloudy";
}

/** Flatten the Open-Meteo hourly arrays into display points. */
export function toHourlyPoints(om: OpenMeteoForecast): HourlyPoint[] {
  return om.hourly.time.map((t, i) => ({
    dt: Date.parse(`${t}Z`) / 1000,
    temp: om.hourly.temperature_2m[i],
    code: wmoToIconCode(om.hourly.weather_code[i]),
    pop: om.hourly.precipitation_probability[i] ?? 0,
  }));
}

/** Flatten the Open-Meteo daily arrays into forecast days. */
export function toDailyForecast(om: OpenMeteoForecast): DailyForecast[] {
  return om.daily.time.map((t, i) => ({
    key: t,
    dt: Date.parse(`${t}T12:00Z`) / 1000,
    code: wmoToIconCode(om.daily.weather_code[i]),
    condition: wmoDescription(om.daily.weather_code[i]),
    min: Math.round(om.daily.temperature_2m_min[i]),
    max: Math.round(om.daily.temperature_2m_max[i]),
  }));
}
