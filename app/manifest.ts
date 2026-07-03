import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ulap — Philippine weather",
    short_name: "ulap",
    description:
      "Live conditions, 24-hour and weekly forecasts, rain probability, and air quality for cities across the Philippines.",
    start_url: "/",
    display: "standalone",
    background_color: "#e3e9f2",
    theme_color: "#e3e9f2",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
