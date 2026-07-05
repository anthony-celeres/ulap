"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Cloud,
  Code2,
  Layers,
  MapPin,
  Moon,
  Palette,
  RefreshCw,
  Server,
  Shield,
  Sun,
  WifiOff,
  Wind,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";

/** Inline GitHub mark — lucide-react dropped its brand icons. */
function GithubMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.2 11.16.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.36-1.34-1.73-1.34-1.73-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.57-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.21a11.6 11.6 0 0 1 3-.4c1.02 0 2.05.13 3 .4 2.29-1.53 3.3-1.21 3.3-1.21.65 1.66.24 2.88.12 3.18.77.83 1.23 1.88 1.23 3.17 0 4.53-2.81 5.53-5.49 5.82.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .31.21.68.83.56A12.02 12.02 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" />
    </svg>
  );
}

const GITHUB_USER = "https://github.com/anthony-celeres";
const GITHUB_REPO = "https://github.com/anthony-celeres/ulap";

const iconButtonClass =
  "flex items-center justify-center cursor-pointer bg-surface rounded-full w-11 h-11 text-muted border border-edge neu-sm active:neu-inset-sm transition-shadow duration-150";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-3xl bg-surface border border-edge/30 neu p-6 xl:p-8 ${className}`}>{children}</section>;
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 text-lg font-bold text-ink mb-4">
      <span className="flex items-center justify-center w-9 h-9 rounded-xl neu-inset-sm text-accent shrink-0">{icon}</span>
      {children}
    </h2>
  );
}

/** A labelled box in the request-flow diagram. */
function FlowBox({ title, lines, accent = false }: { title: string; lines: string[]; accent?: boolean }) {
  return (
    <div
      className={`flex-1 min-w-0 rounded-2xl px-4 py-3.5 text-center ${
        accent ? "bg-hero-grad text-white neu-sm" : "neu-inset-sm text-ink"
      }`}
    >
      <div className="text-sm font-semibold">{title}</div>
      {lines.map((l) => (
        <div key={l} className={`text-xs mt-0.5 ${accent ? "text-white/85" : "text-muted"}`}>
          {l}
        </div>
      ))}
    </div>
  );
}

/** Arrow between flow boxes: horizontal on wide screens, vertical when stacked. */
function FlowArrow() {
  return (
    <div className="flex items-center justify-center text-muted shrink-0" aria-hidden="true">
      <span className="hidden md:block text-xl leading-none">→</span>
      <span className="md:hidden text-xl leading-none">↓</span>
    </div>
  );
}

export default function About() {
  const { theme, toggleTheme } = useTheme();

  const sources = [
    { name: "Open-Meteo", role: "Current nowcast, hourly + daily forecast, UV", note: "CC BY 4.0 · no key", href: "https://open-meteo.com/" },
    { name: "OpenWeatherMap", role: "Place resolution, air quality, geocoding fallback", note: "free tier", href: "https://openweathermap.org/" },
    { name: "Photon / OpenStreetMap", role: "Autocomplete + reverse geocoding to barangay level", note: "ODbL", href: "https://photon.komoot.io/" },
    { name: "CARTO", role: "Themed light/dark map basemaps", note: "attribution", href: "https://carto.com/attributions" },
    { name: "Leaflet", role: "Interactive map rendering", note: "BSD-2", href: "https://leafletjs.com/" },
    { name: "Lucide", role: "Icon set (lucide-react)", note: "ISC", href: "https://lucide.dev/" },
  ];

  const stack = ["Next.js (App Router)", "React 19", "TypeScript", "Tailwind CSS v4", "Leaflet", "Geist font", "PWA + service worker"];

  return (
    <main className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <Link href="/" className={iconButtonClass} aria-label="Back to dashboard" title="Back to dashboard">
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Cloud size={26} className="text-accent" fill="currentColor" strokeWidth={0} aria-hidden="true" />
          <span className="text-gradient">ulap</span>
          <span className="text-muted font-medium">· About</span>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className={`${iconButtonClass} ml-auto`}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
        </button>
      </header>

      {/* Hero */}
      <div className="mb-6">
        <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-ink">
          An <span className="text-gradient">API-integration</span> project, wrapped in a neumorphic UI.
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted max-w-3xl">
          <strong className="text-ink">ulap</strong> ({"“"}cloud{"”"} in Filipino) is an open-source weather
          dashboard for the Philippines. It stitches several free weather and mapping APIs together behind its own
          server routes and presents them through a soft, shadow-based (neumorphic) interface. This page explains who
          built it, how the data flows, and how the design system works.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {["Open source", "MIT License", "Next.js", "TypeScript", "Neumorphic UI", "PWA"].map((b) => (
            <span key={b} className="rounded-full neu-inset-sm px-3 py-1 text-xs font-medium text-muted">
              {b}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Developer / credits */}
        <Card>
          <SectionTitle icon={<GithubMark size={17} />}>Developer</SectionTitle>
          <div className="flex items-center gap-4">
            <Image
              src="/developer.png"
              alt="Anthony Celeres"
              width={56}
              height={56}
              className="rounded-2xl object-cover shrink-0 border border-edge/20 neu-sm"
            />
            <div className="min-w-0">
              <div className="text-base font-semibold text-ink">Anthony Celeres</div>
              <div className="text-sm text-muted">Designer & developer of ulap</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            <a
              href={GITHUB_USER}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-accent text-white neu-sm active:neu-inset-sm px-4 py-2 text-sm font-semibold cursor-pointer transition-shadow duration-150"
            >
              <GithubMark size={16} /> @anthony-celeres
            </a>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-edge neu-sm active:neu-inset-sm px-4 py-2 text-sm font-medium text-ink cursor-pointer transition-shadow duration-150"
            >
              <Code2 size={16} aria-hidden="true" /> View the repo
            </a>
          </div>
          <p className="text-xs text-muted mt-5 leading-relaxed">
            Contributions, issues, and forks are welcome — the project is released under the MIT License, so you can use
            it, learn from it, or build on it freely with attribution.
          </p>
        </Card>

        {/* Tech stack */}
        <Card>
          <SectionTitle icon={<Layers size={17} aria-hidden="true" />}>Built with</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {stack.map((t) => (
              <span key={t} className="rounded-xl neu-inset-sm px-3 py-1.5 text-sm text-ink">
                {t}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted mt-5 leading-relaxed">
            No backend server or database — Next.js route handlers act as a thin, cache-controlled proxy in front of the
            upstream APIs, and the client is a single React dashboard. The whole thing deploys as a static-friendly
            Next.js app.
          </p>
        </Card>
      </div>

      {/* How the API works */}
      <Card className="mt-5">
        <SectionTitle icon={<Server size={17} aria-hidden="true" />}>How the API integration works</SectionTitle>

        {/* Request-flow diagram */}
        <div className="flex flex-col md:flex-row items-stretch gap-3 rounded-2xl neu-inset-sm p-4 mb-6">
          <FlowBox title="Browser" lines={["React dashboard", "never sees the API key"]} />
          <FlowArrow />
          <FlowBox title="Next.js route handlers" lines={["/api/weather", "/api/geocode"]} accent />
          <FlowArrow />
          <FlowBox title="Upstream APIs" lines={["Open-Meteo · OpenWeatherMap", "Photon / OpenStreetMap"]} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl neu-inset-sm p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink mb-1.5">
              <Shield size={15} className="text-accent" aria-hidden="true" /> Key stays on the server
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              The browser only ever calls the app{"’"}s own <code className="rounded neu-inset-sm px-1 py-0.5">/api</code>{" "}
              routes. The OpenWeatherMap key lives in a server environment variable and never reaches the client.
            </p>
          </div>
          <div className="rounded-2xl neu-inset-sm p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink mb-1.5">
              <Cloud size={15} className="text-accent" aria-hidden="true" /> One consistent forecast model
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              <code className="rounded neu-inset-sm px-1 py-0.5">/api/weather</code> uses OpenWeatherMap for the place
              name, coordinates, timezone, and sunrise/sunset, but draws the current conditions, hourly strip, daily
              forecast, and UV from <strong className="text-ink">Open-Meteo</strong> — so every panel agrees instead of
              mixing two disagreeing models.
            </p>
          </div>
          <div className="rounded-2xl neu-inset-sm p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink mb-1.5">
              <MapPin size={15} className="text-accent" aria-hidden="true" /> Geocoding to barangay level
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              <code className="rounded neu-inset-sm px-1 py-0.5">/api/geocode</code> resolves searches and the{" "}
              {"“"}use my location{"”"} button through Photon (OpenStreetMap), Philippines-filtered, with
              OpenWeatherMap geocoding as a fallback.
            </p>
          </div>
          <div className="rounded-2xl neu-inset-sm p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink mb-1.5">
              <RefreshCw size={15} className="text-accent" aria-hidden="true" /> Live when online, cached when not
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Every upstream fetch is <code className="rounded neu-inset-sm px-1 py-0.5">no-store</code>, so being online
              always means real-time data. Offline, the client falls back to the last payload saved in{" "}
              <span className="inline-flex items-center gap-1">
                <WifiOff size={12} aria-hidden="true" /> localStorage
              </span>
              , and an {"“"}As of{"”"} timestamp shows exactly when the reading is from.
            </p>
          </div>
        </div>

        {/* Endpoint table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4 font-medium">Route</th>
                <th className="py-2 pr-4 font-medium">Returns</th>
                <th className="py-2 font-medium">Upstream</th>
              </tr>
            </thead>
            <tbody className="text-ink">
              <tr className="border-t border-edge align-top">
                <td className="py-2.5 pr-4 font-mono text-xs text-accent whitespace-nowrap">/api/weather</td>
                <td className="py-2.5 pr-4 text-muted">Current conditions, hourly, daily, UV, air quality, nearby cities</td>
                <td className="py-2.5 text-muted">Open-Meteo + OpenWeatherMap</td>
              </tr>
              <tr className="border-t border-edge align-top">
                <td className="py-2.5 pr-4 font-mono text-xs text-accent whitespace-nowrap">/api/geocode</td>
                <td className="py-2.5 pr-4 text-muted">Place suggestions + reverse lookup (PH only)</td>
                <td className="py-2.5 text-muted">Photon / OSM + OpenWeatherMap</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Neumorphic design notes */}
      <Card className="mt-5">
        <SectionTitle icon={<Palette size={17} aria-hidden="true" />}>The neumorphic UI</SectionTitle>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Neumorphism (soft UI) gives surfaces depth without hard borders: every card shares the page background and is
          lifted or pressed purely with a pair of light and dark shadows.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: <Layers size={15} aria-hidden="true" />, title: "Raised & pressed surfaces", body: "Two utilities — neu / neu-sm (raised) and neu-inset / neu-inset-sm (pressed) — defined once in globals.css. Selected and active states are “pushed in” rather than outlined." },
            { icon: <Palette size={15} aria-hidden="true" />, title: "Semantic color tokens", body: "Colors are CSS variables mapped into Tailwind (bg-surface, text-muted, text-accent). Dark mode is a single .dark class flip on <html>, applied before first paint to avoid a flash." },
            { icon: <Shield size={15} aria-hidden="true" />, title: "Accessible by design", body: "Because soft UI drops borders, focus rings and text contrast are deliberately strong, interactive surfaces carry a subtle edge for WCAG non-text contrast, and everything is keyboard- and screen-reader-labelled." },
            { icon: <Wind size={15} aria-hidden="true" />, title: "Fluid & calm", body: "A 12-column grid up to 1800px reflows from one column on phones to a full desktop dashboard, and motion is minimal — micro-transitions only, fully suppressed under prefers-reduced-motion." },
          ].map((d) => (
            <div key={d.title} className="rounded-2xl neu-inset-sm p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink mb-1.5">
                <span className="text-accent">{d.icon}</span> {d.title}
              </h3>
              <p className="text-xs text-muted leading-relaxed">{d.body}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Data sources / credits */}
      <Card className="mt-5">
        <SectionTitle icon={<Cloud size={17} aria-hidden="true" />}>Data & attribution</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sources.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start justify-between gap-3 rounded-2xl neu-inset-sm px-4 py-3 cursor-pointer hover:text-accent transition-colors"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">{s.name}</span>
                <span className="block text-xs text-muted mt-0.5">{s.role}</span>
              </span>
              <span className="text-[10px] uppercase tracking-wide text-muted whitespace-nowrap shrink-0 mt-1">{s.note}</span>
            </a>
          ))}
        </div>
      </Card>

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-edge text-xs text-muted">
        <span>© 2026 Anthony Celeres · Released under the MIT License</span>
        <Link href="/" className="flex items-center gap-1.5 hover:text-accent transition-colors">
          <ArrowLeft size={13} aria-hidden="true" /> Back to the dashboard
        </Link>
      </footer>
    </main>
  );
}
