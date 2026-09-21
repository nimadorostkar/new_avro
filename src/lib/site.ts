import config from "./site.json";

/**
 * Site-wide constants. The static values live in site.json so that the build
 * scripts (robots, sitemap, manifest) read the same source; the canonical
 * origin comes from NEXT_PUBLIC_SITE_URL.
 *
 * Nav notes: ORDER NOW goes to the contact page (orders are taken by phone)
 * and LOGIN is a placeholder until an account area exists.
 */
export const SITE = {
  ...config,
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? config.fallbackUrl).replace(/\/$/, ""),
} as const;
