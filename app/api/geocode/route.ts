import { type NextRequest, NextResponse } from "next/server";
import type { GeoSuggestion } from "../../types/weather";

const API_KEY = process.env.OPENWEATHER_API_KEY ?? process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
/** OSM-based geocoder built for autocomplete — resolves down to barangay level. */
const PHOTON_URL = "https://photon.komoot.io/api/";
const OWM_GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";
const OWM_REVERSE_URL = "https://api.openweathermap.org/geo/1.0/reverse";
const COUNTRY = "PH";
/** Philippines bounding box: minLon,minLat,maxLon,maxLat. */
const PH_BBOX = "116.87,4.58,126.61,21.15";

/** Place names are essentially static; cache for a day. */
const REVALIDATE = { next: { revalidate: 86400 } };

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    locality?: string;
    district?: string;
    city?: string;
    county?: string;
    state?: string;
    countrycode?: string;
  };
}

/** "Holy Spirit" → context "Quezon City, Metro Manila" (skipping repeats, including all valid levels). */
function photonToSuggestion(f: PhotonFeature): GeoSuggestion | null {
  const p = f.properties;
  if (!p.name) return null;

  // Build full hierarchy from most specific to most general
  const candidates = [p.street, p.locality, p.district, p.city, p.county, p.state];

  // Filter components:
  // 1. Exclude empty values.
  // 2. Exclude values matching the name itself (case-insensitive).
  // 3. Exclude administrative district noise in context (e.g. "District I", "Southern Manila District").
  const filtered = candidates
    .filter((val): val is string => {
      if (!val) return false;
      const lowerVal = val.toLowerCase();
      if (lowerVal === p.name!.toLowerCase()) return false;
      if (lowerVal.includes("district")) return false;
      return true;
    })
    // Deduplicate
    .filter((val, i, all) => all.findIndex(v => v.toLowerCase() === val.toLowerCase()) === i);

  const context = filtered.join(", ");

  return {
    name: p.name,
    country: COUNTRY,
    state: context || undefined,
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
  };
}

async function searchPhoton(q: string): Promise<GeoSuggestion[]> {
  const r = await fetch(
    `${PHOTON_URL}?q=${encodeURIComponent(q)}&limit=10&bbox=${PH_BBOX}&lang=en`,
    REVALIDATE
  );
  if (!r.ok) throw new Error(`photon ${r.status}`);
  const geo: { features: PhotonFeature[] } = await r.json();
  return geo.features
    .filter((f) => f.properties.countrycode === COUNTRY)
    .map(photonToSuggestion)
    .filter((s): s is GeoSuggestion => s !== null);
}

async function reversePhoton(lat: string, lon: string): Promise<GeoSuggestion[]> {
  const r = await fetch(
    `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`,
    REVALIDATE
  );
  if (!r.ok) throw new Error(`photon reverse ${r.status}`);
  const geo: { features: PhotonFeature[] } = await r.json();
  return geo.features
    .filter((f) => f.properties.countrycode === COUNTRY)
    .map(photonToSuggestion)
    .filter((s): s is GeoSuggestion => s !== null);
}

/** City-level fallback when Photon is unreachable. */
async function searchOwm(q: string): Promise<GeoSuggestion[]> {
  if (!API_KEY) return [];
  const r = await fetch(`${OWM_GEO_URL}?q=${encodeURIComponent(q)},${COUNTRY}&limit=5&appid=${API_KEY}`, REVALIDATE);
  if (!r.ok) return [];
  const data: GeoSuggestion[] = await r.json();
  return data.map(({ name, country, state, lat, lon }) => ({ name, country, state, lat, lon }));
}

/** City-level fallback reverse geocoding when Photon is unreachable. */
async function reverseOwm(lat: string, lon: string): Promise<GeoSuggestion[]> {
  if (!API_KEY) return [];
  const r = await fetch(`${OWM_REVERSE_URL}?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`, REVALIDATE);
  if (!r.ok) return [];
  const data: GeoSuggestion[] = await r.json();
  return data.map(({ name, country, state, lat, lon }) => ({ name, country, state: state || undefined, lat, lon }));
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const lat = req.nextUrl.searchParams.get("lat")?.trim();
  const lon = req.nextUrl.searchParams.get("lon")?.trim();

  if (q && q.length < 2) {
    return NextResponse.json([]);
  }

  if (!q && (!lat || !lon)) {
    return NextResponse.json([]);
  }

  let results: GeoSuggestion[] = [];
  try {
    if (lat && lon) {
      results = await reversePhoton(lat, lon);
    } else if (q) {
      results = await searchPhoton(q);
    }
  } catch {
    try {
      if (lat && lon) {
        results = await reverseOwm(lat, lon);
      } else if (q) {
        results = await searchOwm(q);
      }
    } catch {
      results = [];
    }
  }

  const seen = new Set<string>();
  const unique = results.filter((s) => {
    const k = `${s.name}|${s.state ?? ""}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // If the user search query is comma-separated, check for missing query hierarchy parts
  // and inject them into the suggestion's state (e.g. "San Carlos, Pilar, Bohol").
  let resolvedSuggestions = unique;
  if (q && q.includes(",")) {
    const queryParts = q.split(",").map(part => part.trim()).filter(Boolean);
    const PHILIPPINES_WORDS = ["philippines", "ph", "pilipinas"];
    const isZipCode = (s: string) => /^\d{4}$/.test(s);

    resolvedSuggestions = unique.map((s) => {
      const stateParts = s.state ? s.state.split(",").map(part => part.trim()) : [];
      const missingParts = queryParts.filter((part) => {
        const lower = part.toLowerCase();
        if (PHILIPPINES_WORDS.includes(lower)) return false;
        if (isZipCode(part)) return false;

        const p = lower;
        const n = s.name.toLowerCase();
        if (n.includes(p) || p.includes(n)) return false;
        return !stateParts.some((sp) => {
          const st = sp.toLowerCase();
          return st.includes(p) || p.includes(st);
        });
      });

      if (missingParts.length > 0) {
        return {
          ...s,
          state: [...missingParts, ...stateParts].join(", "),
        };
      }
      return s;
    });
  }

  return NextResponse.json(resolvedSuggestions.slice(0, 6));
}
