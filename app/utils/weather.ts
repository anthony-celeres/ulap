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

export function fmtDayAndDate(unixUTC: number, offsetSec: number) {
  const d = toLocal(unixUTC, offsetSec);
  const now = toLocal(Math.floor(Date.now() / 1000), offsetSec);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateStr = `${DAYS[d.getUTCDay()]}, ${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
  
  const isToday =
    d.getUTCDate() === now.getUTCDate() &&
    d.getUTCMonth() === now.getUTCMonth() &&
    d.getUTCFullYear() === now.getUTCFullYear();

  return isToday ? `Today, ${dateStr}` : dateStr;
}

/** Wind speeds arrive in m/s when units=metric. */
export function msToKmh(ms: number) {
  return Math.round(ms * 3.6);
}

/** DOH/PAGASA-style heat index categories, from the feels-like temp in °C. */
export function heatWarning(feelsLike: number): { label: string; color: string } | null {
  if (feelsLike >= 52) return { label: "Extreme danger", color: "#ef4444" };
  if (feelsLike >= 42) return { label: "Danger", color: "#f97316" };
  if (feelsLike >= 33) return { label: "Extreme caution", color: "#f59e0b" };
  return null;
}

/** WHO UV index categories. */
export function uvCategory(uv: number): { label: string; color: string } {
  if (uv >= 11) return { label: "Extreme", color: "#a855f7" };
  if (uv >= 8) return { label: "Very high", color: "#ef4444" };
  if (uv >= 6) return { label: "High", color: "#f97316" };
  if (uv >= 3) return { label: "Moderate", color: "#f59e0b" };
  return { label: "Low", color: "#22c55e" };
}

/** First thunderstorm or heavy-rain hour within the next 24 hours, if any. */
export function findSevereHour(hours: HourlyPoint[], nowDt: number): HourlyPoint | null {
  return (
    hours.find(
      (h) =>
        h.dt >= nowDt - 1800 &&
        h.dt <= nowDt + 86400 &&
        ((h.code >= 200 && h.code < 300) || h.code === 502 || h.code === 522)
    ) ?? null
  );
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
    uv: om.hourly.uv_index?.[i] ?? undefined,
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

export interface OwmForecastItem {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    feels_like: number;
    pressure: number;
    humidity: number;
  };
  weather: { id: number; main: string; description: string }[];
  pop: number;
}

export function interpolateOwmForecast(
  list: OwmForecastItem[],
  offsetSec: number,
  currentTemp: number,
  currentCode: number,
  minTemp: number
): HourlyPoint[] {
  if (list.length === 0) return [];

  // Shift timestamps to local representation
  const shiftedList = list.map(item => ({
    ...item,
    dt: item.dt + offsetSec
  }));

  // Calculate local midnight of the current day
  const firstItemLocal = new Date(shiftedList[0].dt * 1000);
  firstItemLocal.setUTCHours(0, 0, 0, 0);
  const startDt = firstItemLocal.getTime() / 1000;

  const endDt = shiftedList[shiftedList.length - 1].dt;
  const hourlyPoints: HourlyPoint[] = [];

  const owmMap = new Map<number, OwmForecastItem>();
  for (const item of shiftedList) {
    const t = Math.round(item.dt / 3600) * 3600;
    owmMap.set(t, item);
  }

  for (let dt = startDt; dt <= endDt; dt += 3600) {
    const t = Math.round(dt / 3600) * 3600;
    const exact = owmMap.get(t);
    if (exact) {
      hourlyPoints.push({
        dt,
        temp: exact.main.temp,
        code: exact.weather[0].id,
        pop: Math.round((exact.pop ?? 0) * 100),
      });
    } else if (dt < shiftedList[0].dt) {
      // Past or current hour before forecast starts: interpolate using a realistic diurnal temperature curve
      const localTime = new Date(dt * 1000);
      const hourNum = localTime.getUTCHours();
      const currentLocalTime = new Date(shiftedList[0].dt * 1000);
      const currentHour = currentLocalTime.getUTCHours();

      let temp = currentTemp;
      const minTempHour = 5; // coldest hour (dawn)
      const targetMin = Math.min(minTemp, currentTemp - 1);
      const midnightTemp = targetMin + (currentTemp - targetMin) * 0.4;

      if (hourNum <= minTempHour) {
        // Temp cools down from midnight to dawn
        const fraction = hourNum / minTempHour;
        temp = midnightTemp - (midnightTemp - targetMin) * fraction;
      } else if (hourNum > minTempHour && hourNum <= currentHour) {
        // Temp heats up from dawn to current hour
        const fraction = (hourNum - minTempHour) / (currentHour - minTempHour || 1);
        temp = targetMin + (currentTemp - targetMin) * fraction;
      } else {
        temp = currentTemp;
      }

      hourlyPoints.push({
        dt,
        temp: parseFloat(temp.toFixed(1)),
        code: currentCode,
        pop: 0,
      });
    } else {
      let before: OwmForecastItem | null = null;
      let after: OwmForecastItem | null = null;

      for (let i = shiftedList.length - 1; i >= 0; i--) {
        if (shiftedList[i].dt <= dt) {
          before = shiftedList[i];
          break;
        }
      }
      for (let i = 0; i < shiftedList.length; i++) {
        if (shiftedList[i].dt >= dt) {
          after = shiftedList[i];
          break;
        }
      }

      if (before && after) {
        const fraction = (dt - before.dt) / (after.dt - before.dt);
        const temp = before.main.temp + (after.main.temp - before.main.temp) * fraction;
        const popVal = before.pop + (after.pop - before.pop) * fraction;
        const closest = (dt - before.dt < after.dt - dt) ? before : after;

        hourlyPoints.push({
          dt,
          temp,
          code: closest.weather[0].id,
          pop: Math.round((popVal ?? 0) * 100),
        });
      } else if (before) {
        hourlyPoints.push({
          dt,
          temp: before.main.temp,
          code: before.weather[0].id,
          pop: Math.round((before.pop ?? 0) * 100),
        });
      } else if (after) {
        hourlyPoints.push({
          dt,
          temp: after.main.temp,
          code: after.weather[0].id,
          pop: Math.round((after.pop ?? 0) * 100),
        });
      }
    }
  }

  return hourlyPoints;
}

export function owmToDailyForecast(list: OwmForecastItem[], offsetSec: number): DailyForecast[] {
  const groups: Record<string, OwmForecastItem[]> = {};
  for (const item of list) {
    const key = getLocalDateKey(item.dt, offsetSec);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }

  return Object.keys(groups).map((key) => {
    const items = groups[key];
    let noonItem = items[0];
    let minDiff = Infinity;
    for (const item of items) {
      const d = toLocal(item.dt, offsetSec);
      const hours = d.getUTCHours();
      const diff = Math.abs(hours - 12);
      if (diff < minDiff) {
        minDiff = diff;
        noonItem = item;
      }
    }

    const temps = items.map((item) => item.main.temp);
    const minTemps = items.map((item) => item.main.temp_min);
    const maxTemps = items.map((item) => item.main.temp_max);

    return {
      key,
      dt: noonItem.dt + offsetSec,
      code: noonItem.weather[0].id,
      condition: noonItem.weather[0].description,
      min: Math.round(Math.min(...temps, ...minTemps)),
      max: Math.round(Math.max(...temps, ...maxTemps)),
    };
  });
}

function getLocalDateKey(unixUTC: number, offsetSec: number) {
  const d = toLocal(unixUTC, offsetSec);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
