/**
 * Writes robots.txt, sitemap.xml and manifest.webmanifest into public/ from
 * src/lib/site.json and NEXT_PUBLIC_SITE_URL, so the site needs no runtime
 * routes for them. Runs before `next build` and `next dev`.
 */
import fs from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";

const ROOT = new URL("..", import.meta.url).pathname;
nextEnv.loadEnvConfig(ROOT);

const site = JSON.parse(await fs.readFile(path.join(ROOT, "src/lib/site.json"), "utf8"));
const url = (process.env.NEXT_PUBLIC_SITE_URL ?? site.fallbackUrl).replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);
const out = (file, body) => fs.writeFile(path.join(ROOT, "public", file), body);

await out("robots.txt", `User-Agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`);

await out(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    site.routes
      .map(
        (r) =>
          `  <url>\n    <loc>${url}${r.path === "/" ? "" : r.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changeFrequency}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`,
      )
      .join("\n") +
    `\n</urlset>\n`,
);

await out(
  "manifest.webmanifest",
  JSON.stringify(
    {
      name: site.title,
      short_name: site.name,
      description: site.description,
      start_url: "/",
      display: "standalone",
      background_color: site.themeColor,
      theme_color: site.themeColor,
      icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
    },
    null,
    2,
  ) + "\n",
);

console.log(`meta: robots.txt, sitemap.xml, manifest.webmanifest for ${url}`);
