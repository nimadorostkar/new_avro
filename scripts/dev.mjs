/** `next dev` with the engine rebuilt on every change. */
import { spawn } from "node:child_process";
import { context } from "esbuild";
import { options } from "./build-engine.mjs";

const ctx = await context({ ...options, minify: false, logLevel: "warning" });
await ctx.rebuild();
await ctx.watch();

const next = spawn("npx", ["next", "dev", ...process.argv.slice(2)], { stdio: "inherit" });
next.on("exit", (code) => {
  void ctx.dispose();
  process.exit(code ?? 0);
});
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => next.kill(sig));
