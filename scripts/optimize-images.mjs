/**
 * Builds the served image set in public/ from the originals in assets/.
 *
 *   assets/backgrounds/*.jpg   -> public/backgrounds/*.{avif,webp} (+ *-p: 750x943 centre crop for tall screens)
 *   assets/cups/*.webp         -> public/cups/*.{avif,webp}
 *   assets/sprites/*.webp      -> public/sprites/*.{avif,webp}
 *   assets/sides/*.webp        -> public/sides/*.{avif,webp}
 *   assets/brand/avro-logo.webp-> public/brand/avro-logo.{avif,webp} (400px wide)
 *   assets/backgrounds/iced-latte.jpg -> public/og.jpg (1200x630)
 *
 * Idempotent: run `npm run images` after changing anything in assets/.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = path.join(ROOT, "assets");
const OUT = path.join(ROOT, "public");

const AVIF = { quality: 55, effort: 6 };
const AVIF_PHOTO = { quality: 52, effort: 6 };
const WEBP = { quality: 80, effort: 6 };

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
let before = 0;
let after = 0;

async function emit(file, pipeline) {
  const out = path.join(OUT, file);
  await fs.mkdir(path.dirname(out), { recursive: true });
  const info = await pipeline.toFile(out);
  after += info.size;
  return info.size;
}

async function convert(dir, { avif = AVIF, resize, keepWebp = true } = {}) {
  const files = (await fs.readdir(path.join(SRC, dir))).filter((f) => /\.(webp|jpe?g|png)$/i.test(f)).sort();
  for (const f of files) {
    const src = path.join(SRC, dir, f);
    const base = path.join(dir, f.replace(/\.[^.]+$/, ""));
    const size = (await fs.stat(src)).size;
    before += size;
    const img = () => (resize ? sharp(src).resize(resize) : sharp(src));
    const a = await emit(`${base}.avif`, img().avif(avif));
    // The original WebP is already a good fallback; re-encode only when resizing or the source is not WebP.
    const w =
      keepWebp && !resize && f.endsWith(".webp")
        ? await copyWebp(src, `${base}.webp`)
        : await emit(`${base}.webp`, img().webp(WEBP));
    console.log(`${base.padEnd(32)} ${kb(size).padStart(9)} -> avif ${kb(a).padStart(8)}  webp ${kb(w).padStart(8)}`);
  }
}

async function copyWebp(src, file) {
  const out = path.join(OUT, file);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.copyFile(src, out);
  const size = (await fs.stat(out)).size;
  after += size;
  return size;
}

/** Centre crop of each full landscape for portrait screens, which only see the middle of it. */
async function portraitCrops() {
  const dir = path.join(SRC, "backgrounds");
  for (const f of (await fs.readdir(dir)).filter((f) => /\.jpe?g$/i.test(f)).sort()) {
    const src = path.join(dir, f);
    const { width, height } = await sharp(src).metadata();
    if (width !== 1668 || height !== 943) continue; // the flash is not a landscape
    const base = `backgrounds/${f.replace(/\.[^.]+$/, "")}-p`;
    const crop = () => sharp(src).extract({ left: (1668 - 750) / 2, top: 0, width: 750, height: 943 });
    const a = await emit(`${base}.avif`, crop().avif(AVIF_PHOTO));
    const w = await emit(`${base}.webp`, crop().webp(WEBP));
    console.log(`${base.padEnd(32)} ${"".padStart(9)} -> avif ${kb(a).padStart(8)}  webp ${kb(w).padStart(8)}`);
  }
}

await fs.rm(OUT, { recursive: true, force: true });
await convert("backgrounds", { avif: AVIF_PHOTO });
await portraitCrops();
await convert("cups", { avif: { quality: 60, effort: 6 } });
await convert("sprites");
await convert("sides");
await convert("brand", { resize: { width: 400 }, avif: { quality: 60, effort: 6 } });

// Social preview: 1200x630 crop of the opening landscape.
const og = await emit(
  "og.jpg",
  sharp(path.join(SRC, "backgrounds/iced-latte.jpg")).resize(1200, 630, { fit: "cover", position: "centre" }).jpeg({ quality: 78, mozjpeg: true }),
);
console.log(`${"og.jpg".padEnd(32)} ${"".padStart(9)}    jpeg ${kb(og).padStart(8)}`);
console.log(`\nassets ${kb(before)} -> public ${kb(after)}`);
