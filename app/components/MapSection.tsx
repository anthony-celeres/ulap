"use client";

import dynamic from "next/dynamic";
import { ExternalLink } from "lucide-react";

// Leaflet touches `window` at import time, so load it client-side only.
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-well animate-pulse" aria-hidden="true" />,
});

interface MapSectionProps {
  city: string;
  lat: number;
  lon: number;
}

export default function MapSection({ city, lat, lon }: MapSectionProps) {
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

  return (
    <section aria-label={`Map of ${city}`} className="h-full flex flex-col p-6 rounded-3xl bg-surface border border-edge/30 neu">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ink">Map</h3>
        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full neu-sm active:neu-inset-sm py-1.5 px-4 text-xs text-muted transition-shadow duration-150"
        >
          Open in Google Maps <ExternalLink size={12} aria-hidden="true" />
        </a>
      </div>
      <div className="relative isolate flex-1 min-h-[260px] xl:min-h-[320px] rounded-2xl border border-edge/35 overflow-hidden">
        <LeafletMap lat={lat} lon={lon} city={city} />
      </div>
    </section>
  );
}
