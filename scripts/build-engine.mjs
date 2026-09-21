/**
 * Bundles the browser engine (src/components/hero/client.ts) into public/hero.js.
 * The page ships no framework JavaScript; this file is all the motion needs.
 * `--watch` keeps rebuilding, which scripts/dev.mjs uses next to `next dev`.
 */
import { build, context } from "esbuild";

export const options = {
  entryPoints: ["src/components/hero/client.ts"],
  outfile: "public/hero.js",
  bundle: true,
  minify: true,
  format: "esm",
  target: ["es2022", "safari16", "chrome100", "firefox100"],
  tsconfig: "tsconfig.json",
  legalComments: "none",
  logLevel: "info",
};

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes("--watch")) {
    const ctx = await context(options);
    await ctx.watch();
  } else {
    await build(options);
  }
}
