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

const root = document.querySelector<HTMLElement>(".avro");
if (root) {
  void styled(root).then(() => {
    mountHero(root, DRINKS);
    mountMenu(root);
  });
}
