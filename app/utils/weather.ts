export function iconFromCode(code: string | number) {
  if (!code) return "🌤️";
  const id = typeof code === "string" ? parseInt(code, 10) : code;
  if (id >= 200 && id < 300) return "⛈️";
  if (id >= 300 && id < 400) return "🌦️";
  if (id >= 500 && id < 600) return "🌧️";
  if (id >= 600 && id < 700) return "❄️";
  if (id >= 700 && id < 800) return "🌫️";
  if (id === 800) return "☀️";
  if (id === 801 || id === 802) return "🌤️";
  if (id === 803 || id === 804) return "☁️";
  return "🌤️";
}

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function fmtTime(unixUTC: number, offsetSec: number) {
  const d = new Date((unixUTC + offsetSec) * 1000);
  let h = d.getUTCHours(),
    m = d.getUTCMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function getDayName(unixUTC: number, offsetSec: number) {
  const d = new Date((unixUTC + offsetSec) * 1000);
  return DAYS[d.getUTCDay()];
}

export function getShortDay(unixUTC: number, offsetSec: number) {
  const d = new Date((unixUTC + offsetSec) * 1000);
  return SHORT[d.getUTCDay()];
}
