import type { PageConfig } from "next";
import Link from "next/link";
import { sourceVars, sources } from "@/components/hero/scene";
import { Shell } from "@/components/site/Shell";
import { DRINKS } from "@/data/drinks";
import { faDigits, faIndex } from "@/lib/fa";
import { CLOSE_HASH, MENU_SCRIPT } from "@/lib/menu-script";

export const config: PageConfig = { unstable_runtimeJS: false };

const COPY = {
  title: "منو",
  eyebrow: "منو",
  count: (n: number) => `${faDigits(n)} نوشیدنی`,
  statement: "طلوع را بچشید.",
  lede: "قهوه دم‌سرد، بلوبری وحشی و ماچای سنگ‌آسیاب، سرد شیک‌شده. چهار نوشیدنی، یک طلوع.",
  taste: (word: string) => `طعم ${word}`,
  open: "بزرگ‌تر ببینید",
  close: "بستن",
  prev: "قبلی",
  next: "بعدی",
  home: "دیدن در صفحه اصلی",
} as const;

const lightboxId = (slug: string) => `lb-${slug}`;

/**
 * Every drink on the menu, generated from src/data/drinks.ts. Each card opens
 * a popup: the drink's own landscape irises open, the cup tumbles in. Cups
 * below the first row load lazily, so the list can grow without cost.
 */
export default function MenuPage() {
  return (
    <Shell title={COPY.title} description={COPY.lede} path="/menu">
      <p className="eyebrow">
        {COPY.eyebrow} <span className="eyebrow-count">{COPY.count(DRINKS.length)}</span>
      </p>
      <h1 className="statement">{COPY.statement}</h1>
      <p className="lede">{COPY.lede}</p>

      <ol className="menu-grid">
        {DRINKS.map((d, i) => {
          const cup = sources(d.cup);
          return (
            <li key={d.slug}>
              <a
                className="drink"
                href={`#${lightboxId(d.slug)}`}
                style={{ "--accent": d.color, "--glow": d.sun } as React.CSSProperties}
                aria-label={`${d.fa.name}: ${d.fa.note}. ${COPY.open}`}
              >
                <span className="drink-top">
                  <span className="drink-num">{faIndex(i + 1)}</span>
                  <span className="drink-cta">{COPY.open}</span>
                </span>
                <picture className="drink-cup">
                  <source type="image/avif" srcSet={cup.avif} />
                  <img src={cup.webp} alt="" width={464} height={640} loading={i < 4 ? "eager" : "lazy"} decoding="async" />
                </picture>
                <span className="drink-body">
                  <span className="drink-word">{COPY.taste(d.fa.word)}</span>
                  <span className="drink-name">{d.fa.name}</span>
                  <span className="drink-note">{d.fa.note}</span>
                  <span className="drink-tags">
                    {d.fa.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>

      {DRINKS.map((d, i) => {
        const cup = sources(d.cup);
        const prev = DRINKS[(i - 1 + DRINKS.length) % DRINKS.length]!;
        const next = DRINKS[(i + 1) % DRINKS.length]!;
        return (
          <section
            key={d.slug}
            id={lightboxId(d.slug)}
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${lightboxId(d.slug)}-name`}
            style={{ "--accent": d.color, "--glow": d.sun } as React.CSSProperties}
          >
            <a className="lb-backdrop" href={CLOSE_HASH} aria-label={COPY.close} />
            <div className="lb-bg" style={sourceVars(sources(d.bg), sources(`${d.bg}-p`))} aria-hidden="true" />
            <div className="lb-shade" aria-hidden="true" />
            <div className="lb-ring" aria-hidden="true" />
            <a className="lb-close" href={CLOSE_HASH} aria-label={COPY.close}>
              <span />
              <span />
            </a>
            <div className="lb-panel">
              <picture className="lb-cup">
                <source type="image/avif" srcSet={cup.avif} />
                <img src={cup.webp} alt="" width={464} height={640} loading="lazy" decoding="async" />
              </picture>
              <div className="lb-body">
                <p className="lb-word">
                  <span className="lb-num">{faIndex(i + 1)}</span> {COPY.taste(d.fa.word)}
                </p>
                <h2 className="lb-name" id={`${lightboxId(d.slug)}-name`}>
                  {d.fa.name}
                </h2>
                <p className="lb-note">{d.fa.note}</p>
                <p className="lb-tags">
                  {d.fa.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </p>
                <Link className="button" href={`/#${d.slug}`}>
                  {COPY.home}
                </Link>
              </div>
            </div>
            <nav className="lb-nav" aria-label={`${COPY.prev} / ${COPY.next}`}>
              <a href={`#${lightboxId(prev.slug)}`}>
                <span className="lb-nav-label">{COPY.prev}</span> {prev.fa.name}
              </a>
              <a href={`#${lightboxId(next.slug)}`}>
                {next.fa.name} <span className="lb-nav-label">{COPY.next}</span>
              </a>
            </nav>
          </section>
        );
      })}
      {/* the popups are pure CSS (:target); this only adds Escape and focus, and is hashed in the CSP */}
      <script dangerouslySetInnerHTML={{ __html: MENU_SCRIPT }} />
    </Shell>
  );
}
