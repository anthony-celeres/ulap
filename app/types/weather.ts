/** Subset of the OpenWeatherMap "Current Weather" response that the UI uses. */
export interface CurrentWeather {
  name: string;
  dt: number;
  timezone: number;
  coord: { lat: number; lon: number };
  weather: { id: number; main: string; description: string }[];
  main: {
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
  };
  wind: { speed: number };
  sys: { country: string; sunrise: number; sunset: number };
}

/**
 * Subset of the Open-Meteo forecast response (hourly + daily arrays).
 * With `timezone=auto`, all times are local ISO strings.
 */
export interface OpenMeteoForecast {
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: (number | null)[];
    weather_code: number[];
    uv_index?: (number | null)[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

/** One display hour. */
export interface HourlyPoint {
  /** City-local time encoded as a UTC epoch (format with offset 0). */
  dt: number;
  temp: number;
  /** OpenWeatherMap-style condition id (WMO codes are mapped over). */
  code: number;
  /** Probability of precipitation, 0–100. */
  pop: number;
  /** UV index for the hour. */
  uv?: number;
}

/** One forecast day. */
export interface DailyForecast {
  /** Local date key, YYYY-MM-DD. */
  key: string;
  /** Local noon encoded as a UTC epoch (format with offset 0). */
  dt: number;
  /** OpenWeatherMap-style condition id (WMO codes are mapped over). */
  code: number;
  condition: string;
  min: number;
  max: number;
}

export interface CitySummary {
  name: string;
  /** Small label above the name — region/province for PH cities. */
  country: string;
  condition: string;
  /** OpenWeatherMap condition id. */
  code: number;
  temp: number;
}

/** Everything the dashboard needs, assembled by /api/weather. */
export interface WeatherPayload {
  current: CurrentWeather;
  hourly: HourlyPoint[];
  days: DailyForecast[];
  air: AirQuality | null;
  cities: CitySummary[];
}

/** One result from the OpenWeatherMap Geocoding API (/geo/1.0/direct). */
export interface GeoSuggestion {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

/** OpenWeatherMap Air Pollution response (first list entry). */
export interface AirQuality {
  /** Air Quality Index, 1 (good) – 5 (very poor). */
  aqi: number;
  components: {
    pm2_5: number;
    pm10: number;
    o3: number;
    no2: number;
  };
}
