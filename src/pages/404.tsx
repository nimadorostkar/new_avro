import type { PageConfig } from "next";
import Head from "next/head";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const config: PageConfig = { unstable_runtimeJS: false };

export default function NotFound() {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>{`Not found — ${SITE.name}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main
        style={{
          minHeight: "100svh",
          display: "grid",
          placeContent: "center",
          gap: "1.5rem",
          padding: "2rem",
          textAlign: "center",
          letterSpacing: ".08em",
          textTransform: "uppercase",
        }}
      >
        <h1 style={{ font: "400 clamp(48px, 12vw, 160px)/.9 var(--sans)", letterSpacing: "-.035em" }}>404</h1>
        <p style={{ color: "var(--crema)" }}>That page has not been brewed yet.</p>
        <Link href="/" style={{ borderBottom: "1px solid currentColor", justifySelf: "center" }}>
          Back to the sunrise
        </Link>
      </main>
    </>
  );
}
