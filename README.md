# ☁️ ulap

**ulap** (Filipino for *"cloud"*) is a responsive weather dashboard for the Philippines — live conditions, a 5-day forecast, hourly rain probability, and air quality for any Philippine city, powered by the [OpenWeatherMap API](https://openweathermap.org/api).

Built with **Next.js (App Router) · React · TypeScript · Tailwind CSS v4**.

## Features

- **Live current conditions** — temperature, real feel, wind, pressure, humidity, sunrise/sunset, all shown in the searched city's local time.
- **Hourly today + 6-day forecast** — a Google Weather-style toggle backed by real per-hour data from Open-Meteo: *Today* shows all 24 hours of the local day in two clock-aligned rows (12 AM–11 AM over 12 PM–11 PM), with the current hour highlighted; *Next 6 days* shows a full week of day cards with real high/low temperatures. Both strips scroll horizontally with neumorphic arrow buttons (and swipe/trackpad) — no visible scrollbar, nothing cut off at any screen size.
- **Hourly rain chart** — real probability-of-precipitation data. In the 6-day view, click any day card to see that day's hourly rain chances.
- **Air quality** — toggle the chart panel to see the Air Quality Index (1–5) and PM2.5 / PM10 / O₃ / NO₂ concentrations.
- **City search with autocomplete + geolocation** — type a few letters and pick from live, Philippines-only location suggestions with their province (OpenWeatherMap Geocoding API, with keyboard navigation); weather then loads by exact coordinates. Or use the locate button for where you are.
- **Themed interactive map** — Leaflet with CARTO basemaps (light and dark to match the theme), centered on the selected city.
- **Dark / light theme** — follows your OS preference by default; the toggle persists your choice, with no flash on reload.
- **Remembers your city** — the last searched city is stored locally and restored on your next visit.
- **Installable PWA with offline fallback** — a web manifest and a conservative service worker make ulap installable to the home screen; the last successful payload is kept locally, so going offline shows clearly-labeled saved weather instead of an error.
- **PH-aware warnings** — UV index with WHO categories, a DOH/PAGASA-style heat-index caution, and a banner when thunderstorms or heavy rain are expected in the next 24 hours.
- **Personal touches** — recent searches appear when the search box is focused, first-time visitors are offered their own location, and data freshness is always visible ("Updated X min ago" + manual refresh).
- **Resilient UX** — loading skeletons, inline error banners that keep existing data on screen, and a friendly setup screen if the API key is missing.
- **Accessible** — semantic HTML, keyboard-focus styles, ARIA labels on interactive elements and chart bars, and `prefers-reduced-motion` support.
- **Responsive** — single-column on mobile, multi-column dashboard on desktop.

## Getting started

### 1. Prerequisites

- Node.js (LTS)
- A free OpenWeatherMap API key — sign up at [openweathermap.org/api](https://openweathermap.org/api)

### 2. Install and configure

```bash
npm install
cp .env.example .env.local
# then edit .env.local and paste your API key
```

`.env.local` should contain:

```
OPENWEATHER_API_KEY=your_key_here
```

> **Security:** the key never reaches the browser — all upstream calls go through the app's own `/api/weather` and `/api/geocode` route handlers, which also cache responses server-side (10 minutes for weather, 24 hours for place names) so repeat visits are fast and the free-tier quota is preserved. The legacy `NEXT_PUBLIC_OPENWEATHER_API_KEY` name still works as a fallback.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
app/
├── components/
│   ├── TopBar.tsx          # Branding, location, search form, geolocation + theme toggle
│   ├── TodayCard.tsx       # Current conditions (gradient hero card)
│   ├── ForecastCard.tsx    # One selectable day: icon + high/low
│   ├── RainChart.tsx       # Hourly rain-probability bar chart
│   ├── AirQualityCard.tsx  # AQI badge + pollutant bars
│   ├── WeatherIcon.tsx     # Condition code → colored lucide icon
│   ├── MapSection.tsx      # Map card (loads LeafletMap client-side)
│   ├── LeafletMap.tsx      # Leaflet + CARTO basemap, theme-aware
│   └── CitiesList.tsx      # Other large cities (click to switch)
├── hooks/
│   └── useTheme.ts         # Dark/light theme state, persisted to localStorage
├── types/
│   └── weather.ts          # Typed OpenWeatherMap response shapes
├── utils/
│   └── weather.ts          # Formatting, unit conversion, daily aggregation
├── globals.css             # Design tokens (light + dark) mapped into Tailwind
├── layout.tsx              # Metadata, fonts, no-flash theme init script
└── page.tsx                # Data fetching + dashboard layout
```

## How it works

1. **Data** — the client calls the app's own `/api/weather` route, which resolves the city via OpenWeatherMap, then in parallel fetches the Open-Meteo forecast (real hourly temperature/rain-probability/condition plus 8 daily summaries), OpenWeatherMap air pollution, and the side cities — all cached server-side and returned as one payload. The dashboard silently revalidates every 10 minutes and when the tab regains focus, and shows an "Updated X min ago" badge with a manual refresh button.
2. **Condition mapping** — Open-Meteo reports WMO weather codes; `wmoToIconCode()` maps them onto the OpenWeatherMap-style ids that `WeatherIcon` renders, so both sources share one icon system.
3. **Theming** — all colors are CSS custom properties defined in `globals.css` for light and dark, mapped into Tailwind v4 via `@theme inline` so components use semantic utilities like `bg-surface` and `text-muted`. A tiny inline script in `layout.tsx` applies the saved theme before first paint.
4. **Times** — OpenWeatherMap returns UTC timestamps plus a timezone offset; all displayed times are shifted into the *city's* local time, not the viewer's.

## Design decisions

- **Neumorphic (soft-UI) design system** — surfaces share the page background and get their depth from paired light/dark shadows. Raised (`neu`, `neu-sm`) and inset (`neu-inset`, `neu-inset-sm`) utilities are defined once in `globals.css`; selection states are "pressed in" rather than outlined. Because neumorphism drops borders, keyboard focus rings and text contrast are deliberately strong.
- **Fluid, screen-filling layout** — a 12-column grid up to 1800px wide reflows from a single column on phones to hero + forecast + chart / map + cities regions on desktop, so large screens are actually used.
- **Semantic color tokens over hard-coded hex** — every component reads from the token palette, so dark mode is a single class flip on `<html>`.
- **Errors don't wipe the screen** — a failed search shows a dismissible banner while the previous city's data stays visible; a full-page error appears only when there is nothing to show yet.
- **Motion is minimal** — micro-transitions (≤150 ms) on hover/focus only, and everything is suppressed under `prefers-reduced-motion`.

## Git workflow

This repo uses a lightweight git-flow:

- `main` — stable; only receives release PRs from `develop`, merged manually on GitHub.
- `develop` — integration branch.
- `feature/<name>` — one branch per feature with atomic conventional commits, merged into `develop` via PR with a merge commit (so the graph shows merge lines).

Helper script (requires the [GitHub CLI](https://cli.github.com/)):

```bash
scripts/gitflow.sh setup            # one-time: enable the commit-msg hook
scripts/gitflow.sh feature my-thing # start feature/my-thing off develop
# ...make atomic commits...
scripts/gitflow.sh ship             # push, PR to develop, merge
scripts/gitflow.sh release          # open the develop → main PR
```

The `commit-msg` hook enforces `type(scope): subject` conventional messages and blocks AI co-author trailers. `ship` refuses features with fewer than 3 commits (pass `--force` for a genuinely complete small change) — let work accumulate instead of merging one-commit branches.

## Credits

- Current conditions, air-quality, and geocoding data: [OpenWeatherMap](https://openweathermap.org/)
- Hourly and daily forecast data: [Open-Meteo](https://open-meteo.com/) (CC BY 4.0, no API key)
- Icons: [Lucide](https://lucide.dev/) (`lucide-react`)
- Map: [Leaflet](https://leafletjs.com/) with © [OpenStreetMap](https://www.openstreetmap.org/copyright) © [CARTO](https://carto.com/attributions) basemaps
- Fonts: [Geist](https://vercel.com/font) via `next/font`
