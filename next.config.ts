import { createHash } from "node:crypto";
import type { NextConfig } from "next";
import { MENU_SCRIPT } from "./src/lib/menu-script";

const ONE_YEAR = 60 * 60 * 24 * 365;
const isProd = process.env.NODE_ENV === "production";

/**
 * The pages ship no framework JavaScript; the only scripts are /hero.js and one
 * inline handler on the menu page, allowed here by its hash. Inline styles are
 * how the scene positions its artwork, so style-src keeps 'unsafe-inline'.
 * Applied in production only: `next dev` injects its own tooling scripts.
 */
const menuScriptHash = `'sha256-${createHash("sha256").update(MENU_SCRIPT).digest("base64")}'`;
const csp = [
  "default-src 'self'",
  `script-src 'self' ${menuScriptHash}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Artwork is pre-encoded by scripts/optimize-images.mjs, so the runtime optimizer is not used.
  images: { unoptimized: true },
  async headers() {
    return [
      {
        // Extracted artwork is content-addressed by path and never changes in place.
        source: "/:dir(backgrounds|cups|sprites|sides|brand)/:file*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${ONE_YEAR}, immutable` }],
      },
      {
        // The engine is content-hashed through its query string (see pages/index.tsx).
        source: "/hero.js",
        headers: [{ key: "Cache-Control", value: `public, max-age=${ONE_YEAR}, immutable` }],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ...(isProd
            ? [
                { key: "Content-Security-Policy", value: csp },
                { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
