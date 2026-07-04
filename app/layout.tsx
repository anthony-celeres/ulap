import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ServiceWorker from "./components/ServiceWorker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ulap — weather dashboard",
  description:
    "An open-source weather dashboard for the Philippines — live conditions, multi-day forecast, rain probability, and air quality, integrating Open-Meteo and OpenWeatherMap behind a neumorphic UI.",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
};

// Applies the saved (or OS-preferred) theme before first paint to avoid a flash.
// Priority: ?theme= URL override (handy for sharing/testing) → saved choice → OS preference.
const themeInitScript = `(function(){try{var p=new URLSearchParams(location.search).get("theme");var t=p||localStorage.getItem("ulap-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
