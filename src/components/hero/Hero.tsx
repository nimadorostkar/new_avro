import type { Drink } from "@/data/drinks";
import { SITE } from "@/lib/site";
import { layoutBits, sourceData, sourceVars, sources } from "./scene";

/* falling drops from the leaf tips: [x, y, duration, delay] in artwork pixels / seconds */
const DROPS = [
  [417, 138, 5.2, 3.2],
  [1017, 174, 6.4, 4.6],
  [1235, 246, 4.6, 6.1],
  [205, 270, 7.1, 5.3],
] as const;

const u = (px: number) => `calc(var(--u)*${px})`;

/**
 * Only the opening drink's artwork is in the first paint. Everything else
 * carries its sources as data attributes and is loaded by the engine when
 * the drink is one step away (see `warm` in engine.ts).
 */
const eager = (i: number) => i === 0;

/** Background-image element: eager ones get CSS variables, lazy ones data attributes. */
const bgProps = (base: string, i: number, portrait = false) => {
  const full = sources(base);
  const crop = portrait ? sources(`${base}-p`) : undefined;
  return eager(i) ? { style: sourceVars(full, crop) } : sourceData(full, crop);
};

type PicProps = {
  base: string;
  alt: string;
  width: number;
  height: number;
  lazy?: boolean;
  fetchPriority?: "high" | "auto";
};

/** AVIF with a WebP fallback. Lazy pictures hold their sources until the engine sets them. */
function Pic({ base, alt, width, height, lazy, fetchPriority }: PicProps) {
  const { avif, webp } = sources(base);
  return (
    <picture>
      <source type="image/avif" {...(lazy ? { "data-srcset": avif } : { srcSet: avif })} />
      <img {...(lazy ? { "data-src": webp } : { src: webp })} alt={alt} width={width} height={height} decoding="async" fetchPriority={fetchPriority} />
    </picture>
  );
}

/**
 * Server-rendered markup only. Every element the engine drives carries a
 * `data-*` hook; the engine (client.ts, built to public/hero.js) finds them
 * and takes over once the script loads. Nothing here runs in the browser.
 * (`suppressHydrationWarning` marks attributes the engine owns: production
 * ships no React, but `next dev` still hydrates.)
 */
export function Hero({ drinks }: { drinks: readonly Drink[] }) {
  const first = drinks[0];
  if (!first) return null;

  return (
    <div className="avro">
      <div className="hero">
        <div className="scene">
          <div className="cam" data-cam>
            <div className="layer" data-depth=".012" suppressHydrationWarning>
              <div className="bg">
                {drinks.map((d, i) => (
                  <div key={d.slug} className={eager(i) ? "bgv on" : "bgv"} data-bg={i} {...bgProps(d.bg, i, true)}>
                    {d.flash && <div className="flash" data-flash {...bgProps(d.flash, i)} />}
                  </div>
                ))}
              </div>
            </div>
            <div className="layer" data-depth=".012" suppressHydrationWarning>
              <div className="sun" data-sun />
            </div>
            <canvas className="motes" data-motes aria-hidden="true" suppressHydrationWarning />

            <div className="layer drops" data-drops data-depth=".02" aria-hidden="true" suppressHydrationWarning>
              {DROPS.map(([x, y, t, delay]) => (
                <b
                  key={`${x}-${y}`}
                  className="drop"
                  style={{ left: u(x), top: u(y), "--t": `${t}s`, "--d": `${delay}s` } as React.CSSProperties}
                />
              ))}
            </div>

            <div className="layer" data-depth=".05" aria-hidden="true" suppressHydrationWarning>
              <div className="bits">
                {drinks.map((d, n) => (
                  <div key={d.slug} className={eager(n) ? "set on" : "set"} data-set={n}>
                    {layoutBits(d, n).map((b) => (
                      <div key={b.key} className="bit" style={b.style}>
                        <i
                          className={b.flat ? (eager(n) ? "in intro" : "in") : "in ph"}
                          style={eager(n) ? { ...b.innerStyle, ...sourceVars(b.sources) } : b.innerStyle}
                          {...(eager(n) ? {} : sourceData(b.sources))}
                          data-bit
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="splash glow" data-glow />
            <div className="splash ring" data-ring />

            <div className="layer" data-depth=".034" suppressHydrationWarning>
              <div className="cupwrap" data-cupwrap suppressHydrationWarning>
                <div className="cuprise">
                  <div className="cuptilt">
                    <div className="cupfloat">
                      {drinks.map((d, i) => (
                        <div key={d.slug} className={eager(i) ? "cupslot is-active" : "cupslot"} data-slot={i} suppressHydrationWarning>
                          <Pic
                            base={d.cup}
                            alt={`AVRO! ${d.name} in a clear cup with a black lid`}
                            width={464}
                            height={640}
                            lazy={!eager(i)}
                            fetchPriority={eager(i) ? "high" : undefined}
                          />
                          <i className="rim shade1" />
                          <i className="rim warm" />
                          <i className="rim sweep" data-sweep />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="call c1" data-call>
                <i className="pin" />
                <svg width="1" height="1" aria-hidden="true">
                  <polyline points="0,0 30,-34 30,-46" />
                </svg>
                <button type="button" className="tag" data-tag>
                  {first.tags[0]}
                </button>
              </div>
              <div className="call c2" data-call>
                <i className="pin" />
                <svg width="1" height="1" aria-hidden="true">
                  <polyline points="0,0 44,20 44,32" />
                </svg>
                <button type="button" className="tag" data-tag>
                  {first.tags[1]}
                </button>
              </div>
            </div>

            <div className="layer sides" data-depth=".075" aria-hidden="true" suppressHydrationWarning>
              {drinks.map(
                (d, i) =>
                  d.sides && (
                    <div key={d.slug} className={eager(i) ? "sideset on" : "sideset"} data-sideset={i}>
                      {d.sides.map(([src, x, w], k) => (
                        <div key={src} className={k ? "side r" : "side l"} style={{ left: u(x), width: u(w) }} data-side>
                          <i {...bgProps(src, i)} />
                        </div>
                      ))}
                    </div>
                  ),
              )}
            </div>

            <div className="shade" />
          </div>
        </div>
      </div>

      {/* scroll track: one snap step per drink */}
      <div data-steps>
        {drinks.map((d) => (
          <section key={d.slug} className="step" id={d.slug} data-step>
            <h2>{d.name}</h2>
          </section>
        ))}
      </div>

      <div className="ui">
        <div className="frame" />
        <nav className="nav" aria-label="Primary">
          <a className="brand" href="#iced-latte" aria-label="AVRO! home">
            <Pic base="/brand/avro-logo" alt="AVRO!" width={400} height={103} fetchPriority="high" />
          </a>
          <div className="links">
            {SITE.nav.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>
          <div className="right">
            <a className="action" href={SITE.action.href}>
              {SITE.action.label}
            </a>
            <button type="button" className="burger" aria-label="Open menu" aria-expanded="false" aria-controls="site-menu" data-menu-open>
              <span />
              <span />
              <span />
            </button>
          </div>
        </nav>

        <h1 className="title" aria-label={`Taste the ${first.word.toLowerCase()}`} data-title>
          <span className="w w1" aria-hidden="true">
            <span className="ch intro" style={{ "--dl": ".9s" } as React.CSSProperties}>
              Taste
            </span>
          </span>
          <span className="w w2" aria-hidden="true">
            <span className="ch intro" style={{ "--dl": "1.05s" } as React.CSSProperties}>
              the
            </span>
          </span>
          <span className="w w3" aria-hidden="true" data-word>
            {[...first.word].map((c, i) => (
              <span key={i} className="ch intro" style={{ "--dl": `${1.3 + i * 0.05}s` } as React.CSSProperties}>
                {c}
              </span>
            ))}
          </span>
        </h1>

        <p className="note">
          <svg viewBox="0 0 58 26" aria-hidden="true">
            <rect x=".5" y=".5" width="57" height="25" />
            <circle cx="21" cy="13" r="10" />
            <circle cx="29" cy="13" r="10" />
            <circle cx="37" cy="13" r="10" />
          </svg>
          <span aria-live="polite" data-note>
            <b>{first.name}</b>
            {first.note}
          </span>
        </p>

        <div className="rail" role="navigation" aria-label="Drinks" data-rail>
          {drinks.map((d, i) => (
            <button
              key={d.slug}
              type="button"
              aria-label={d.name}
              aria-current={i === 0 ? "true" : "false"}
              data-rail-item={i}
            >
              <span className="num">0{i + 1}</span>
              <span className="nm">{d.name}</span>
              <span className="bar" />
            </button>
          ))}
          <i className="cue" />
        </div>
      </div>

      <div id="site-menu" className="menu" role="dialog" aria-modal="true" aria-label="Menu" hidden data-menu>
        <button type="button" className="menu-close" aria-label="Close menu" data-menu-close>
          <span />
          <span />
        </button>
        <nav className="menu-links" aria-label="Primary">
          {[...SITE.nav, SITE.action].map((l, i) => (
            <a key={l.href} href={l.href} style={{ "--i": i } as React.CSSProperties}>
              {l.label}
            </a>
          ))}
        </nav>
        <ul className="menu-drinks" aria-label="Drinks">
          {drinks.map((d, i) => (
            <li key={d.slug}>
              <button type="button" data-rail-item={i}>
                <span className="num">0{i + 1}</span>
                {d.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
