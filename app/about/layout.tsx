import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About ulap — how it's built",
  description:
    "How ulap works: an open-source weather dashboard that integrates Open-Meteo and OpenWeatherMap behind its own API routes, wrapped in a neumorphic UI. Built by Anthony Celeres.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
