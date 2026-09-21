import { Vazirmatn } from "next/font/google";

/** Persian type for the About and Contact pages; Geist has no Arabic-script glyphs. */
export const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-fa",
  display: "swap",
});
