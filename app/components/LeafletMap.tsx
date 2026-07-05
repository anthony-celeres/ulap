"use client";

import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "../hooks/useTheme";

const TILES = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

interface LeafletMapProps {
  lat: number;
  lon: number;
  city: string;
}

export default function LeafletMap({ lat, lon, city }: LeafletMapProps) {
  const { theme } = useTheme();

  return (
    // MapContainer ignores center/tile changes after mount, so remount per city + theme.
    <MapContainer
      key={`${lat},${lon},${theme}`}
      center={[lat, lon]}
      zoom={11}
      zoomControl={false}
      scrollWheelZoom={false}
      className="absolute inset-0"
    >
      <TileLayer url={TILES[theme]} attribution={ATTRIBUTION} />
      <CircleMarker
        center={[lat, lon]}
        radius={9}
        pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#2f7cf6", fillOpacity: 1 }}
      >
        <Tooltip direction="top" offset={[0, -10]}>
          {city}
        </Tooltip>
      </CircleMarker>
    </MapContainer>
  );
}
