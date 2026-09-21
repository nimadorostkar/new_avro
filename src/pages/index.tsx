import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { GetStaticProps, InferGetStaticPropsType, PageConfig } from "next";
import Head from "next/head";
import { Hero } from "@/components/hero/Hero";
import { sources } from "@/components/hero/scene";
import { DRINKS } from "@/data/drinks";
import { SITE } from "@/lib/site";

/**
 * The page is static HTML + CSS: no React on the client. The motion lives in
 * one small script built by scripts/build-engine.mjs and served from public/.
 */
export const config: PageConfig = { unstable_runtimeJS: false };

export const getStaticProps = (async () => {
  // Content-hash the engine so it can be cached forever and still update with every deploy.
  const engine = await readFile(path.join(process.cwd(), "public", "hero.js"));
  const hash = createHash("sha256").update(engine).digest("hex").slice(0, 10);
  return { props: { engineSrc: `/hero.js?v=${hash}` } };
}) satisfies GetStaticProps;

export default function HomePage({ engineSrc }: InferGetStaticPropsType<typeof getStaticProps>) {
  const first = DRINKS[0]!;
  const bg = sources(first.bg);
  const bgPortrait = sources(`${first.bg}-p`);
  const cup = sources(first.cup);
  const og = `${SITE.url}/og.jpg`;

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>{SITE.title}</title>
        <meta name="description" content={SITE.description} />
        <meta name="application-name" content={SITE.name} />
        <meta name="theme-color" content="#07110b" />
        <meta name="color-scheme" content="dark" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={SITE.url} />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE.name} />
        <meta property="og:title" content={SITE.title} />
        <meta property="og:description" content={SITE.description} />
        <meta property="og:url" content={SITE.url} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image" content={og} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="A cup of AVRO! Iced Latte at sunrise" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE.title} />
        <meta name="twitter:description" content={SITE.description} />
        <meta name="twitter:image" content={og} />
        {/* The opening frame: landscape (full or portrait crop) and cup, ahead of everything else.
            Browsers without AVIF ignore these and load the WebP fallbacks normally. */}
        <link rel="preload" as="image" type="image/avif" href={bg.avif} media="(min-aspect-ratio: 4/5)" fetchPriority="high" />
        <link rel="preload" as="image" type="image/avif" href={bgPortrait.avif} media="(max-aspect-ratio: 4/5)" fetchPriority="high" />
        <link rel="preload" as="image" type="image/avif" href={cup.avif} fetchPriority="high" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- module scripts are deferred by definition */}
        <script type="module" src={engineSrc} />
      </Head>
      <main>
        <Hero drinks={DRINKS} />
      </main>
    </>
  );
}
