import { type NextRequest, NextResponse } from "next/server";
import type { GeoSuggestion } from "../../types/weather";

const API_KEY = process.env.OPENWEATHER_API_KEY ?? process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
/** OSM-based geocoder built for autocomplete — resolves down to barangay level. */
const PHOTON_URL = "https://photon.komoot.io/api/";
const OWM_GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";
const COUNTRY = "PH";
/** Philippines bounding box: minLon,minLat,maxLon,maxLat. */
const PH_BBOX = "116.87,4.58,126.61,21.15";

/** Place names are essentially static; cache for a day. */
const REVALIDATE = { next: { revalidate: 86400 } };

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    district?: string;
    city?: string;
    county?: string;
    state?: string;
    countrycode?: string;
  };
}

/** "Holy Spirit" → context "Quezon City, Metro Manila" (skipping repeats). */
function photonToSuggestion(f: PhotonFeature): GeoSuggestion | null {
  const p = f.properties;
  if (!p.name) return null;
  const context = [p.district, p.city, p.county, p.state]
    .filter((part): part is string => !!part && part !== p.name)
    .filter((part, i, all) => all.indexOf(part) === i)
    .slice(0, 2)
    .join(", ");
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

/** City-level fallback when Photon is unreachable. */
async function searchOwm(q: string): Promise<GeoSuggestion[]> {
  if (!API_KEY) return [];
  const r = await fetch(`${OWM_GEO_URL}?q=${encodeURIComponent(q)},${COUNTRY}&limit=5&appid=${API_KEY}`, REVALIDATE);
  if (!r.ok) return [];
  const data: GeoSuggestion[] = await r.json();
  return data.map(({ name, country, state, lat, lon }) => ({ name, country, state, lat, lon }));
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  let results: GeoSuggestion[];
  try {
    results = await searchPhoton(q);
  } catch {
    results = await searchOwm(q);
  }

  const seen = new Set<string>();
  const unique = results.filter((s) => {
    const k = `${s.name}|${s.state ?? ""}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return NextResponse.json(unique.slice(0, 6));
}
