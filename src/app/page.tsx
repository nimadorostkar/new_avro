import { preload } from "react-dom";
import { Hero } from "@/components/hero/Hero";
import { DRINKS } from "@/data/drinks";

export default function HomePage() {
  // The opening frame is the first landscape; fetch it ahead of the scripts.
  const first = DRINKS[0];
  if (first) preload(first.bg, { as: "image", fetchPriority: "high" });

  return (
    <main>
      <Hero drinks={DRINKS} />
    </main>
  );
}
