import type { PageConfig } from "next";
import Link from "next/link";
import { sources } from "@/components/hero/scene";
import { Shell } from "@/components/site/Shell";
import { DRINKS } from "@/data/drinks";
import { SITE } from "@/lib/site";

export const config: PageConfig = { unstable_runtimeJS: false };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Every drink on the menu, generated from src/data/drinks.ts. Each card links
 * to its step on the landing page, where the full scene plays. Cups below the
 * first row load lazily, so the list can grow without weighing the page down.
 */
export default function MenuPage() {
  return (
    <Shell title="Menu" description={SITE.description} path="/menu" lang="en">
      <p className="eyebrow">
        Menu <span className="eyebrow-count">{pad(DRINKS.length)} drinks</span>
      </p>
      <h1 className="statement">Taste the sunrise.</h1>
      <p className="lede">{SITE.description}</p>

      <ol className="menu-grid">
        {DRINKS.map((d, i) => {
          const cup = sources(d.cup);
          return (
            <li key={d.slug}>
              <Link
                className="drink"
                href={`/#${d.slug}`}
                style={{ "--accent": d.color, "--glow": d.sun } as React.CSSProperties}
                aria-label={`${d.name}: ${d.note}. See it on the home page`}
              >
                <span className="drink-top">
                  <span className="drink-num">{pad(i + 1)}</span>
                  <span className="drink-cta">Taste it</span>
                </span>
                <picture className="drink-cup">
                  <source type="image/avif" srcSet={cup.avif} />
                  <img src={cup.webp} alt="" width={464} height={640} loading={i < 4 ? "eager" : "lazy"} decoding="async" />
                </picture>
                <span className="drink-body">
                  <span className="drink-word">Taste the {d.word.toLowerCase()}</span>
                  <span className="drink-name">{d.name}</span>
                  <span className="drink-note">{d.note}</span>
                  <span className="drink-tags">
                    {d.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </Shell>
  );
}
