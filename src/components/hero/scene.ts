import type { Bit, Drink } from "@/data/drinks";
import { SPRITES } from "@/data/sprites";

/** The artwork is authored at 1668x943 and cover-fitted; one unit = one artwork pixel. */
export const SCENE = { w: 1668, h: 943, aspect: 1668 / 943 } as const;

/** Centre of the cup, in artwork pixels: the iris, shockwave and confetti all start here. */
export const CUP_CENTER = { x: 848, y: 494 } as const;

/** Size of one artwork pixel in CSS pixels for the current viewport (mirrors the CSS `--u`). */
export const unit = () => Math.max(window.innerWidth, window.innerHeight * SCENE.aspect) / SCENE.w;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Height of one scroll step (a full viewport), read from the DOM so it matches `100svh`. */
export const stepHeight = () =>
  document.querySelector<HTMLElement>("[data-step]")?.offsetHeight ?? window.innerHeight;

export const scrollToDrink = (index: number) =>
  window.scrollTo({ top: index * stepHeight(), behavior: prefersReducedMotion() ? "auto" : "smooth" });

const u = (px: number) => `calc(var(--u)*${px})`;

/** The two encodings every image is served in (see scripts/optimize-images.mjs). */
export type Sources = { avif: string; webp: string };
export const sources = (base: string): Sources => ({ avif: `${base}.avif`, webp: `${base}.webp` });

/**
 * Inline style that hands both encodings to the stylesheet, which picks one
 * with `image-set()` where supported and falls back to WebP elsewhere.
 */
export const sourceVars = ({ avif, webp }: Sources) =>
  ({ "--avif": `url("${avif}")`, "--webp": `url("${webp}")` }) as React.CSSProperties;

/** The same pair as data attributes, for elements that load on demand. */
export const sourceData = ({ avif, webp }: Sources) => ({ "data-avif": avif, "data-webp": webp });

export type BitGeometry = {
  /** Vector from the bit back to the cup (artwork px): where it is thrown from. */
  dx: number;
  dy: number;
  /** Unit vector away from the cup: where it is blasted to. */
  ox: number;
  oy: number;
  /** Alternating spin direction. */
  sg: 1 | -1;
};

export type BitLayout = {
  key: string;
  sources: Sources;
  /** Depth-of-field sprites get a blur + drop shadow; flat ones are drawn as-is. */
  flat: boolean;
  /** Inline style for the `.bit` wrapper (position, size and the drift/burst CSS variables). */
  style: React.CSSProperties;
  /** Inline style for the sprite itself (rotation and blur). */
  innerStyle: React.CSSProperties;
  geometry: BitGeometry;
};

/** Resolve one drink's ingredient list into positioned, animatable sprites. */
export function layoutBits(drink: Drink, drinkIndex: number): BitLayout[] {
  const { x: cx, y: cy } = CUP_CENTER;
  return drink.bits.map((bit: Bit, i) => {
    const [key, mx, my, size, rot = 0, blur] = bit;
    const sprite = SPRITES[key];
    const h = (size * sprite.h) / sprite.w;
    const sg: 1 | -1 = i % 2 ? -1 : 1;
    const len = Math.hypot(mx - cx, my - cy);
    const flat = blur === undefined;

    const style = {
      left: u(mx - size / 2),
      top: u(my - h / 2),
      width: u(size),
      height: u(h),
      "--i": i,
      "--fx": u((cx - mx) * 0.8),
      "--fy": u((cy - my) * 0.8 + 60),
      "--fr": `${sg * (120 + i * 25)}deg`,
      "--dx": u(-sg * (10 + i * 2)),
      "--dy": u(-(16 + ((i * 7) % 18))),
      "--dr": `${-sg * (drinkIndex ? 22 + i * 3 : 10 + i * 3)}deg`,
      "--t": `${6 + ((i * 1.3) % 4)}s`,
    } as React.CSSProperties;

    const innerStyle = (flat ? {} : { "--b": `${blur}px`, "--r": `${rot}deg` }) as React.CSSProperties;

    return {
      key: `${key}-${i}`,
      sources: sources(sprite.src),
      flat,
      style,
      innerStyle,
      geometry: { dx: cx - mx, dy: cy - my, ox: (mx - cx) / len, oy: (my - cy) / len, sg },
    };
  });
}
