import type { NextConfig } from "next";

const ONE_YEAR = 60 * 60 * 24 * 365;

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
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
