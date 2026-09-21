import { preload } from "react-dom";
import { Hero } from "@/components/hero/Hero";
import { sources } from "@/components/hero/scene";
import { DRINKS } from "@/data/drinks";

export default function HomePage() {
  // The opening frame is the first landscape and cup: fetch them ahead of the scripts.
  // Browsers without AVIF ignore these hints and load the WebP fallbacks normally.
  const first = DRINKS[0];
  if (first) {
    preload(sources(first.bg).avif, { as: "image", type: "image/avif", fetchPriority: "high" });
    preload(sources(first.cup).avif, { as: "image", type: "image/avif", fetchPriority: "high" });
  }

  return (
    <main>
      <Hero />
    </main>
  );
}
