"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Cloud, LocateFixed, MapPin, Moon, RefreshCw, Search, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import type { GeoSuggestion } from "../types/weather";

/** Server route; suggestions come back Philippines-only and deduplicated. */
const GEO_URL = "/api/geocode";
const RECENTS_KEY = "ulap-recents";

function loadRecents(): GeoSuggestion[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const list: { name: string; lat: number; lon: number }[] = JSON.parse(raw);
    return list.map((r) => ({ name: r.name, country: "PH", lat: r.lat, lon: r.lon }));
  } catch {
    return [];
  }
}

interface TopBarProps {
  city: string;
  country?: string;
  inputCity: string;
  loading: boolean;
  updatedAt: number | null;
  onCityInput: (city: string) => void;
  onSearch: (city: string) => void;
  onSelectLocation: (place: GeoSuggestion) => void;
  onLocate: () => void;
  onRefresh: () => void;
}

const iconButtonClass =
  "flex items-center justify-center cursor-pointer bg-surface rounded-full w-11 h-11 text-muted border border-edge neu-sm active:neu-inset-sm transition-shadow duration-150";

// Every suggestion is in the Philippines, so the province/region is the
// useful disambiguator (five PH towns are named San Fernando).
function suggestionLabel(s: GeoSuggestion) {
  return s.state ?? "Philippines";
}

function UpdatedBadge({ updatedAt, loading, onRefresh }: { updatedAt: number | null; loading: boolean; onRefresh: () => void }) {
  const [label, setLabel] = useState("Updated just now");

  useEffect(() => {
    if (!updatedAt) return;
    const compute = () => {
      const mins = Math.floor((Date.now() - updatedAt) / 60_000);
      setLabel(mins < 1 ? "Updated just now" : `Updated ${mins} min ago`);
    };
    const raf = requestAnimationFrame(compute);
    const id = setInterval(compute, 60_000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, [updatedAt]);

  if (!updatedAt) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted whitespace-nowrap">
      <span className="hidden lg:inline">{label}</span>
      <button
        type="button"
        onClick={onRefresh}
        aria-label="Refresh weather now"
        title={label}
        className="flex items-center justify-center w-11 h-11 rounded-full bg-surface text-muted border border-edge neu-sm active:neu-inset-sm transition-shadow duration-150 cursor-pointer"
      >
        <RefreshCw size={16} className={loading ? "animate-spin" : ""} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function TopBar({
  city,
  country,
  inputCity,
  loading,
  updatedAt,
  onCityInput,
  onSearch,
  onSelectLocation,
  onLocate,
  onRefresh,
}: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [recents, setRecents] = useState<GeoSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const geoAbortRef = useRef<AbortController | null>(null);

  // Debounced geocoding lookup while the user types.
  // (Clearing on short input happens in the onChange handler, not here.)
  useEffect(() => {
    const q = inputCity.trim();
    if (q.length < 2) return;
    const timer = setTimeout(async () => {
      // Only when the user is actually typing here — the page also sets
      // inputCity programmatically after a fetch resolves.
      if (document.activeElement !== inputRef.current) return;
      geoAbortRef.current?.abort();
      const ac = new AbortController();
      geoAbortRef.current = ac;
      try {
        const r = await fetch(`${GEO_URL}?q=${encodeURIComponent(q)}`, { signal: ac.signal });
        if (!r.ok) return;
        const unique: GeoSuggestion[] = await r.json();
        setSuggestions(unique);
        setOpen(unique.length > 0);
        setActive(-1);
      } catch {
        // aborted or network hiccup — the plain submit path still works
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputCity]);

  // With fewer than 2 characters typed, the dropdown offers recent searches.
  const showingRecents = inputCity.trim().length < 2;
  const items = showingRecents ? recents : suggestions;

  const choose = (s: GeoSuggestion) => {
    setOpen(false);
    setSuggestions([]);
    setActive(-1);
    inputRef.current?.blur();
    onSelectLocation(s);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (items.length === 0) return;
      e.preventDefault();
      setOpen(true);
      const dir = e.key === "ArrowDown" ? 1 : -1;
      setActive((prev) => (prev + dir + items.length) % items.length);
    } else if (e.key === "Enter") {
      if (open && active >= 0 && items[active]) {
        e.preventDefault();
        choose(items[active]);
      }
      // otherwise the form submits → plain name search
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-8">
      <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <Cloud size={28} className="text-accent" fill="currentColor" strokeWidth={0} aria-hidden="true" />
        <span className="text-gradient">ulap</span>
      </div>

      <form
        className="relative flex-1 min-w-[220px] flex gap-3"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setOpen(false);
          onSearch(inputCity);
        }}
      >
        <Search
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          className="flex-1 min-w-0 bg-transparent rounded-full border border-edge neu-inset-sm py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-muted outline-none"
          type="text"
          placeholder="Search a city in the Philippines…"
          role="combobox"
          aria-label="Search city"
          aria-expanded={open}
          aria-controls="city-suggestions"
          aria-activedescendant={active >= 0 ? `city-option-${active}` : undefined}
          autoComplete="off"
          value={inputCity}
          onChange={(e) => {
            onCityInput(e.target.value);
            if (e.target.value.trim().length < 2) {
              setSuggestions([]);
              setActive(-1);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setRecents(loadRecents());
            setOpen(true);
            setActive(-1);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {/* Raised pill like the active view toggles. */}
        <button
          type="submit"
          disabled={loading}
          className="bg-surface text-accent neu-sm active:neu-inset-sm rounded-full px-5 py-2.5 text-sm font-semibold cursor-pointer transition-shadow duration-150 whitespace-nowrap disabled:opacity-60 disabled:cursor-wait"
        >
          Search
        </button>

        {open && items.length > 0 && (
          <ul
            id="city-suggestions"
            role="listbox"
            aria-label={showingRecents ? "Recent searches" : "City suggestions"}
            className="absolute left-0 right-0 top-full mt-3 z-50 rounded-3xl border border-edge neu bg-app p-2"
          >
            {showingRecents && (
              <li aria-hidden="true" className="px-4 pt-1.5 pb-1 text-xs uppercase tracking-wide text-muted">
                Recent
              </li>
            )}
            {items.map((s, i) => (
              <li key={`${s.name}-${s.lat}-${s.lon}`} role="option" aria-selected={i === active} id={`city-option-${i}`}>
                <button
                  type="button"
                  // mousedown fires before the input's blur, so the click isn't lost
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(s);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={`w-full flex items-center gap-3 text-left rounded-2xl px-4 py-2.5 cursor-pointer transition-shadow duration-150 ${
                    i === active ? "neu-inset-sm" : ""
                  }`}
                >
                  {showingRecents ? (
                    <Clock size={14} className="text-muted shrink-0" aria-hidden="true" />
                  ) : (
                    <MapPin size={14} className="text-accent shrink-0" aria-hidden="true" />
                  )}
                  <span className="text-sm font-medium text-ink">{s.name}</span>
                  {!showingRecents && <span className="text-xs text-muted truncate">{suggestionLabel(s)}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      {/* Below md this drops to its own row: location left, controls right. */}
      <div className="flex items-center gap-3 basis-full justify-between md:basis-auto md:ml-auto md:justify-end">
        {/* Plain label, styled like the section headings. */}
        <div className="flex items-center gap-2 text-sm font-semibold text-ink whitespace-nowrap">
          <MapPin size={15} className="text-accent" aria-hidden="true" />
          <span>
            {city}
            {country ? `, ${country}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <UpdatedBadge updatedAt={updatedAt} loading={loading} onRefresh={onRefresh} />
          <button type="button" className={iconButtonClass} onClick={onLocate} aria-label="Use my location" title="Use my location">
            <LocateFixed size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={iconButtonClass}
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
