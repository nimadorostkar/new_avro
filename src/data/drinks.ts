import type { SpriteKey } from "./sprites";

/**
 * A floating ingredient, positioned in artwork pixels (1668x943 scene).
 * `[sprite, centerX, centerY, width, rotationDeg, blurPx]`
 * Omit `blur` for a flat sprite (no depth-of-field, no drop shadow).
 */
export type Bit = readonly [
  sprite: SpriteKey,
  x: number,
  y: number,
  size: number,
  rot?: number,
  blur?: number,
];

/** A foreground plant framing the page edge: `[src, x, width]` in artwork pixels. */
export type SidePlant = readonly [src: string, x: number, width: number];

export type Drink = {
  /** URL-safe id; also names the files in /public/cups and /public/backgrounds. */
  slug: string;
  name: string;
  /** The last word of the headline: "Taste the ___". */
  word: string;
  /** Two callout labels pinned to the cup. */
  tags: readonly [string, string];
  note: string;
  cup: string;
  bg: string;
  /** Optional splash photo shown inside the iris before the landscape resolves. */
  flash?: string;
  /** Accent colour of the shockwave ring and glow. */
  color: string;
  /** Colour of the sun's radial glow. */
  sun: string;
  /** RGB of the rising dust motes and how many to draw (0 = none). */
  mote: readonly [number, number, number];
  motes: number;
  /** Sprites that fall through the air and burst out of the cup on arrival. */
  fall?: readonly SpriteKey[];
  /** Flat colours for drawn petals when there is no `fall` set. */
  petals?: readonly string[];
  bits: readonly Bit[];
  sides?: readonly [SidePlant, SidePlant];
};

/** Foreground plantation leaves. Assign to a drink's `sides` to frame it. */
export const PLANTATION_SIDES = [
  ["/sides/plant-left.webp", 0, 549],
  ["/sides/plant-right.webp", 1259, 409],
] as const satisfies readonly [SidePlant, SidePlant];

/* ---- the menu: edit names / copy here ---- */
export const DRINKS: readonly Drink[] = [
  {
    slug: "iced-latte",
    name: "Iced Latte",
    word: "Sunrise",
    tags: ["COLD-BREWED 18H", "HAND-PICKED"],
    note: "Mountain-grown coffee, shaken cold for slow mornings and long afternoons",
    cup: "/cups/iced-latte.webp",
    bg: "/backgrounds/iced-latte.jpg",
    color: "#f0d29a",
    sun: "rgba(255,214,140,.6)",
    mote: [255, 224, 160],
    motes: 46,
    bits: [
      ["latte-0", 675, 339, 80],
      ["latte-1", 610, 421, 90],
      ["latte-2", 666, 485, 68],
      ["latte-3", 1069, 408, 90],
      ["latte-4", 1147.5, 465, 95],
      ["latte-5", 1031, 546.5, 86],
      ["latte-6", 636, 594.5, 72],
    ],
  },
  {
    slug: "blue-mango",
    name: "Blue Mango",
    word: "Horizon",
    tags: ["WILD BLUEBERRY", "RIPE MANGO"],
    note: "Blueberry over cold milk, resting on a layer of ripe mango",
    cup: "/cups/blue-mango.webp",
    bg: "/backgrounds/blue-mango.jpg",
    flash: "/backgrounds/berry-splash.jpg",
    color: "#8d8ff0",
    sun: "rgba(255,196,120,.6)",
    mote: [200, 210, 255],
    motes: 34,
    fall: ["b1", "b2", "b3", "b4", "leaf", "b5"],
    bits: [
      ["bbA", 618, 288, 112, -8, 0.3],
      ["cubes", 452, 322, 176, -16, 0.3],
      ["b1", 650, 470, 46, 30, 0.3],
      ["bbC", 598, 596, 88, 12, 0.3],
      ["b2", 330, 540, 150, -20, 5],
      ["b3", 1082, 372, 64, -10, 0.3],
      ["slice", 1185, 478, 200, 16, 0.3],
      ["b5", 1094, 556, 50, -35, 0.3],
      ["bbB", 1262, 640, 150, 18, 5],
      ["leaf", 1306, 366, 54, -30, 1.6],
      ["b4", 934, 152, 44, 40, 0.8],
    ],
  },
  {
    slug: "matcha-mango",
    name: "Matcha Mango",
    word: "Garden",
    tags: ["STONE-GROUND MATCHA", "RIPE MANGO"],
    note: "Whisked matcha and cold milk poured slowly over ripe mango",
    cup: "/cups/matcha-mango.webp",
    bg: "/backgrounds/matcha-mango.jpg",
    color: "#b5d86a",
    sun: "rgba(225,255,150,.55)",
    mote: [190, 232, 110],
    motes: 0,
    fall: ["tl0", "tl3", "tl8", "tl1", "ms2", "tl4", "tl7"],
    bits: [
      ["tl5", 578, 296, 120, -12, 0.3],
      ["ms2", 528, 440, 165, -18, 0.3],
      ["tl3", 640, 474, 70, 35, 0.3],
      ["tl4", 592, 590, 100, 20, 0.3],
      ["tl0", 430, 335, 190, -30, 5],
      ["tl6", 1082, 366, 112, 14, 0.3],
      ["ms1", 1182, 470, 120, 12, 0.3],
      ["tl8", 1094, 552, 84, -25, 0.3],
      ["ms0", 1262, 640, 190, -10, 5],
      ["tl1", 1306, 368, 84, 40, 1.6],
      ["tl2", 934, 150, 84, -15, 0.8],
    ],
  },
  {
    slug: "blue-latte",
    name: "Blue Latte",
    word: "Sky",
    tags: ["WILD BLUEBERRY", "FRESH MILK"],
    note: "Blueberry and cold fresh milk. Blue by nature, nothing added",
    cup: "/cups/blue-latte.webp",
    bg: "/backgrounds/blue-latte.jpg",
    flash: "/backgrounds/berry-splash.jpg",
    color: "#9aa8ff",
    sun: "rgba(190,215,255,.65)",
    mote: [225, 232, 255],
    motes: 26,
    fall: ["b1", "md0", "b3", "md2", "b4", "md1", "leaf", "md3"],
    bits: [
      ["milk", 850, 610, 920, 8, 0.3],
      ["bbA", 585, 298, 112, 12, 0.3],
      ["b3", 545, 428, 62, 0, 0.3],
      ["bbE", 642, 476, 78, -20, 0.3],
      ["md4", 600, 585, 40, 0, 0.3],
      ["b2", 438, 338, 150, 20, 5],
      ["bbD", 1086, 364, 94, 14, 0.3],
      ["b5", 1168, 468, 56, -25, 0.3],
      ["md0", 1094, 548, 38, 0, 0.3],
      ["bbB", 1258, 628, 150, -18, 5],
      ["b4", 1306, 368, 52, 30, 1.6],
      ["md2", 934, 152, 36, 0, 0.8],
    ],
  },
];
