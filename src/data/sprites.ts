/**
 * Cut-out ingredient photos that float around the cup. `src` is the path
 * without extension: every image is served as AVIF with a WebP fallback (see
 * scripts/optimize-images.mjs). `w`/`h` are the intrinsic pixel sizes; the
 * scene uses them to keep each sprite's aspect ratio in artwork units.
 */
export const SPRITES = {
  bbA: { src: "/sprites/bbA", w: 157, h: 183 },
  bbB: { src: "/sprites/bbB", w: 110, h: 148 },
  bbC: { src: "/sprites/bbC", w: 106, h: 153 },
  bbD: { src: "/sprites/bbD", w: 103, h: 131 },
  bbE: { src: "/sprites/bbE", w: 96, h: 84 },
  b1: { src: "/sprites/b1", w: 72, h: 66 },
  b2: { src: "/sprites/b2", w: 67, h: 65 },
  b3: { src: "/sprites/b3", w: 61, h: 67 },
  b4: { src: "/sprites/b4", w: 58, h: 64 },
  b5: { src: "/sprites/b5", w: 59, h: 64 },
  leaf: { src: "/sprites/leaf", w: 58, h: 76 },
  slice: { src: "/sprites/slice", w: 420, h: 234 },
  cubes: { src: "/sprites/cubes", w: 520, h: 253 },
  tl0: { src: "/sprites/tl0", w: 280, h: 171 },
  tl1: { src: "/sprites/tl1", w: 316, h: 134 },
  tl2: { src: "/sprites/tl2", w: 358, h: 158 },
  tl3: { src: "/sprites/tl3", w: 207, h: 110 },
  tl4: { src: "/sprites/tl4", w: 166, h: 177 },
  tl5: { src: "/sprites/tl5", w: 178, h: 162 },
  tl6: { src: "/sprites/tl6", w: 178, h: 161 },
  tl7: { src: "/sprites/tl7", w: 166, h: 154 },
  tl8: { src: "/sprites/tl8", w: 210, h: 100 },
  ms0: { src: "/sprites/ms0", w: 407, h: 430 },
  ms1: { src: "/sprites/ms1", w: 312, h: 492 },
  ms2: { src: "/sprites/ms2", w: 430, h: 214 },
  milk: { src: "/sprites/milk", w: 1000, h: 634 },
  md0: { src: "/sprites/md0", w: 38, h: 41 },
  md1: { src: "/sprites/md1", w: 46, h: 34 },
  md2: { src: "/sprites/md2", w: 39, h: 37 },
  md3: { src: "/sprites/md3", w: 36, h: 40 },
  md4: { src: "/sprites/md4", w: 32, h: 38 },
  "latte-0": { src: "/sprites/latte-0", w: 80, h: 78 },
  "latte-1": { src: "/sprites/latte-1", w: 90, h: 98 },
  "latte-2": { src: "/sprites/latte-2", w: 68, h: 70 },
  "latte-3": { src: "/sprites/latte-3", w: 90, h: 84 },
  "latte-4": { src: "/sprites/latte-4", w: 95, h: 90 },
  "latte-5": { src: "/sprites/latte-5", w: 86, h: 87 },
  "latte-6": { src: "/sprites/latte-6", w: 72, h: 63 },
} as const satisfies Record<string, Sprite>;

export type Sprite = { src: string; w: number; h: number };
export type SpriteKey = keyof typeof SPRITES;
