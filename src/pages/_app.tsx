import type { AppProps } from "next/app";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect } from "react";
import "@/styles/globals.css";
import "@/components/hero/hero.css";
import "@/styles/pages.css";

const geistSans = Geist({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-geist-mono",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  // Only reached under `next dev` (production ships no React): lets hero.js wait for hydration before touching the DOM.
  useEffect(() => {
    window.__avroHydrated = true;
    window.dispatchEvent(new Event("avro:hydrated"));
  }, []);

  return (
    <div className={`app ${geistSans.variable} ${geistMono.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
