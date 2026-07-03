"use client";

import { useEffect, useRef, useState } from "react";
import { Cloud, LocateFixed, MapPin, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import type { GeoSuggestion } from "../types/weather";

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";
/** Suggestions are Philippines-only. */
const COUNTRY = "PH";

interface TopBarProps {
  city: string;
  country?: string;
  inputCity: string;
  loading: boolean;
  onCityInput: (city: string) => void;
  onSearch: (city: string) => void;
  onSelectLocation: (place: GeoSuggestion) => void;
  onLocate: () => void;
}

const iconButtonClass =
  "flex items-center justify-center cursor-pointer bg-surface rounded-full w-11 h-11 text-muted neu-sm active:neu-inset-sm transition-shadow duration-150";

// Every suggestion is in the Philippines, so the province/region is the
// useful disambiguator (five PH towns are named San Fernando).
function suggestionLabel(s: GeoSuggestion) {
  return s.state ?? "Philippines";
}

export default function TopBar({
  city,
  country,
  inputCity,
  loading,
  onCityInput,
  onSearch,
  onSelectLocation,
  onLocate,
}: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced geocoding lookup while the user types.
  // (Clearing on short input happens in the onChange handler, not here.)
  useEffect(() => {
    const q = inputCity.trim();
    if (q.length < 2) return;
    const timer = setTimeout(async () => {
      // Only when the user is actually typing here — the page also sets
      // inputCity programmatically after a fetch resolves.
      if (document.activeElement !== inputRef.current) return;
      try {
        const r = await fetch(`${GEO_URL}?q=${encodeURIComponent(q)},${COUNTRY}&limit=5&appid=${API_KEY}`);
        if (!r.ok) return;
        const data: GeoSuggestion[] = await r.json();
        const seen = new Set<string>();
        const unique = data.filter((s) => {
          const k = `${s.name}|${s.state ?? ""}|${s.country}`;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        setSuggestions(unique);
        setOpen(unique.length > 0);
        setActive(-1);
      } catch {
        // network hiccup — the plain submit path still works
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputCity]);

  const choose = (s: GeoSuggestion) => {
    setOpen(false);
    setSuggestions([]);
    setActive(-1);
    inputRef.current?.blur();
    onSelectLocation(s);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (suggestions.length === 0) return;
      e.preventDefault();
      setOpen(true);
      const dir = e.key === "ArrowDown" ? 1 : -1;
      setActive((prev) => (prev + dir + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (open && active >= 0) {
        e.preventDefault();
        choose(suggestions[active]);
      }
      // otherwise the form submits → plain name search
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Cloud size={28} className="text-accent" fill="currentColor" strokeWidth={0} aria-hidden="true" />
          <span className="text-gradient">ulap</span>
        </div>
        <div className="flex items-center gap-2 rounded-full neu-sm py-2.5 px-5 text-sm font-medium text-ink">
          <MapPin size={15} className="text-accent" aria-hidden="true" />
          <span>
            {city}
            {country ? `, ${country}` : ""}
          </span>
        </div>
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
          className="flex-1 min-w-0 bg-transparent rounded-full neu-inset-sm py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-muted outline-none"
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
              setOpen(false);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-hero-grad text-white rounded-full px-6 py-2.5 text-sm font-semibold cursor-pointer neu-sm hover:opacity-90 active:opacity-75 transition-opacity duration-150 whitespace-nowrap disabled:opacity-60 disabled:cursor-wait"
        >
          {loading ? "Loading…" : "Search"}
        </button>

        {open && (
          <ul
            id="city-suggestions"
            role="listbox"
            aria-label="City suggestions"
            className="absolute left-0 right-0 top-full mt-3 z-50 rounded-3xl neu bg-app p-2"
          >
            {suggestions.map((s, i) => (
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
                  <MapPin size={14} className="text-accent shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium text-ink">{s.name}</span>
                  <span className="text-xs text-muted truncate">{suggestionLabel(s)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="flex gap-3 ml-auto">
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
    </header>
  );
}
