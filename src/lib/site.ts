export const SITE = {
  name: "AVRO!",
  title: "AVRO! — Taste the Sunrise",
  description:
    "Cold-brewed coffee, wild blueberry and stone-ground matcha, shaken cold. Four drinks, one sunrise.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://avro.example.com",
  locale: "en",
  /** Primary navigation. These are placeholders until the sections exist. */
  nav: [
    { label: "MENU", href: "/menu" },
    { label: "CONTACT", href: "/contact" },
    { label: "ABOUT US", href: "/about" },
    { label: "ORDER NOW", href: "#order" },
  ],
  /** The action link at the right of the nav (and last in the mobile menu). */
  action: { label: "LOGIN", href: "#login" },
} as const;
