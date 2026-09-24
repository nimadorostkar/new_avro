/**
 * Browser entry, bundled by scripts/build-engine.mjs into public/hero.js.
 * The page itself ships no framework JavaScript; this is all of it.
 */
import { DRINKS } from "@/data/drinks";
import { mountHero } from "./engine";
import { mountMenu } from "./menu";

/**
 * Resolves once hero.css governs the page. In production the stylesheet is a
 * blocking <link>, so this is immediate; in development Next injects CSS from
 * JavaScript after hydration, and measuring the scene before that would be wrong.
 */
const styled = (root: HTMLElement) =>
  new Promise<void>((resolve) => {
    const check = () => (getComputedStyle(root).getPropertyValue("--bk") ? resolve() : requestAnimationFrame(check));
    check();
  });

/** `next dev` still hydrates the page; mutating the DOM before that finishes causes hydration mismatches. */
const hydrated = () =>
  new Promise<void>((resolve) => {
    if (process.env.NODE_ENV === "production" || window.__avroHydrated) return resolve();
    window.addEventListener("avro:hydrated", () => resolve(), { once: true });
  });

const root = document.querySelector<HTMLElement>(".avro");
if (root) {
  void Promise.all([hydrated(), styled(root)]).then(() => {
    mountHero(root, DRINKS);
    mountMenu(root);
  });
}
