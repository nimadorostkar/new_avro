export const SITE = {
  name: "AVRO!",
  title: "AVRO! — Taste the Sunrise",
  description:
    "Cold-brewed coffee, wild blueberry and stone-ground matcha, shaken cold. Four drinks, one sunrise.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://avro.example.com",
  locale: "en",
  /** Primary navigation. These are placeholders until the sections exist. */
  nav: [
    { label: "BEANS", href: "#beans" },
    { label: "THE RITUAL", href: "#ritual" },
    { label: "ORIGINS", href: "#origins" },
    { label: "SUSTAINABILITY", href: "#sustainability" },
  ],
  shop: { label: "SHOP NOW", href: "#shop" },
} as const;
