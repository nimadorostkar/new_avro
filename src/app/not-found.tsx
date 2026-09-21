import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return (
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
  );
}
