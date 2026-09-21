/**
 * Browser entry, bundled by scripts/build-engine.mjs into public/hero.js.
 * The page itself ships no framework JavaScript; this is all of it.
 */
import { DRINKS } from "@/data/drinks";
import { mountHero } from "./engine";
import { mountMenu } from "./menu";

const root = document.querySelector<HTMLElement>(".avro");
if (root) {
  mountHero(root, DRINKS);
  mountMenu(root);
}
