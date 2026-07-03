import { type NextRequest, NextResponse } from "next/server";
import type { GeoSuggestion } from "../../types/weather";

const API_KEY = process.env.OPENWEATHER_API_KEY ?? process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";
const COUNTRY = "PH";

export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "missing_key" }, { status: 503 });
  }
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const r = await fetch(
    `${GEO_URL}?q=${encodeURIComponent(q)},${COUNTRY}&limit=5&appid=${API_KEY}`,
    // Place names are essentially static; cache for a day.
    { next: { revalidate: 86400 } }
  );
  if (!r.ok) {
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }

  const data: GeoSuggestion[] = await r.json();
  const seen = new Set<string>();
  const unique = data.filter((s) => {
    const k = `${s.name}|${s.state ?? ""}|${s.country}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return NextResponse.json(unique.map(({ name, country, state, lat, lon }) => ({ name, country, state, lat, lon })));
}
