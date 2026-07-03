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

/** One 3-hour slot from the OpenWeatherMap "5 Day / 3 Hour Forecast" response. */
export interface ForecastSlot {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
  };
  weather: { id: number; main: string; description: string }[];
  /** Probability of precipitation, 0–1. */
  pop: number;
}

export interface ForecastResponse {
  list: ForecastSlot[];
  city: { timezone: number };
}

/** A day aggregated from its 3-hour slots. */
export interface DailyForecast {
  /** Local date key, YYYY-MM-DD. */
  key: string;
  /** Timestamp of the representative (closest-to-midday) slot. */
  dt: number;
  /** OpenWeatherMap condition id of the representative slot. */
  code: number;
  condition: string;
  min: number;
  max: number;
  slots: ForecastSlot[];
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

/** One display hour, interpolated from the 3-hourly forecast slots. */
export interface HourlyPoint {
  dt: number;
  temp: number;
  /** OpenWeatherMap condition id of the nearest real slot. */
  code: number;
  /** Probability of precipitation of the nearest real slot, 0–1. */
  pop: number;
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
