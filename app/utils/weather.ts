import type { DailyForecast, ForecastSlot, HourlyPoint } from "../types/weather";

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Shift a UTC timestamp into the city's local time (OpenWeather gives offsets in seconds). */
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
 * Expand 3-hourly forecast slots into per-hour points: temperature is
 * linearly interpolated between slots; condition and rain probability are
 * held from the nearest real slot (they are not meaningfully divisible).
 */
export function interpolateHourly(slots: ForecastSlot[], hours = 24): HourlyPoint[] {
  const points: HourlyPoint[] = [];
  for (let i = 0; i < slots.length - 1 && points.length < hours; i++) {
    const a = slots[i];
    const b = slots[i + 1];
    const stepC = (b.main.temp - a.main.temp) / 3;
    for (let h = 0; h < 3 && points.length < hours; h++) {
      const nearest = h < 2 ? a : b;
      points.push({
        dt: a.dt + h * 3600,
        temp: a.main.temp + stepC * h,
        code: nearest.weather[0].id,
        pop: nearest.pop,
      });
    }
  }
  return points;
}

/**
 * Fold the 3-hourly forecast list into per-day summaries: real min/max
 * across the day's slots, with the closest-to-midday slot providing the
 * representative icon and condition.
 */
export function groupForecastByDay(list: ForecastSlot[], offsetSec: number): DailyForecast[] {
  const groups = new Map<string, ForecastSlot[]>();
  for (const slot of list) {
    const key = toLocal(slot.dt, offsetSec).toISOString().slice(0, 10);
    const bucket = groups.get(key);
    if (bucket) bucket.push(slot);
    else groups.set(key, [slot]);
  }

  return Array.from(groups.entries()).map(([key, slots]) => {
    const midday = slots.reduce((best, s) => {
      const hour = (t: ForecastSlot) => toLocal(t.dt, offsetSec).getUTCHours();
      return Math.abs(hour(s) - 13) < Math.abs(hour(best) - 13) ? s : best;
    });
    return {
      key,
      dt: midday.dt,
      code: midday.weather[0].id,
      condition: midday.weather[0].description,
      min: Math.round(Math.min(...slots.map((s) => s.main.temp_min))),
      max: Math.round(Math.max(...slots.map((s) => s.main.temp_max))),
      slots,
    };
  });
}
