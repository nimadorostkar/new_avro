"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Drink } from "@/data/drinks";
import { SITE } from "@/lib/site";
import { mountHero } from "./engine";
import { layoutBits, scrollToDrink } from "./scene";
import "./hero.css";

/* falling drops from the leaf tips: [x, y, duration, delay] in artwork pixels / seconds */
const DROPS = [
  [417, 138, 5.2, 3.2],
  [1017, 174, 6.4, 4.6],
  [1235, 246, 4.6, 6.1],
  [205, 270, 7.1, 5.3],
] as const;

const u = (px: number) => `calc(var(--u)*${px})`;

type Props = { drinks: readonly Drink[] };

export function Hero({ drinks }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const first = drinks[0];

  useEffect(() => {
    if (!root.current) return;
    return mountHero(root.current, drinks);
  }, [drinks]);

  if (!first) return null;

  return (
    <div className="avro" ref={root}>
      <div className="hero">
        <div className="scene">
          <div className="cam" data-cam>
            <div className="layer" data-depth=".012">
              <div className="bg">
                {drinks.map((d, i) => (
                  <div
                    key={d.slug}
                    className={i === 0 ? "bgv on" : "bgv"}
                    style={{ backgroundImage: `url(${d.bg})` }}
                    data-bg={i}
                  >
                    {d.flash && <div className="flash" style={{ backgroundImage: `url(${d.flash})` }} data-flash />}
                  </div>
                ))}
              </div>
            </div>
            <div className="layer" data-depth=".012">
              <div className="sun" data-sun />
            </div>
            <canvas className="motes" data-motes aria-hidden="true" />

            <div className="layer drops" data-drops data-depth=".02" aria-hidden="true">
              {DROPS.map(([x, y, t, delay]) => (
                <b
                  key={`${x}-${y}`}
                  className="drop"
                  style={{ left: u(x), top: u(y), "--t": `${t}s`, "--d": `${delay}s` } as React.CSSProperties}
                />
              ))}
            </div>

            <div className="layer" data-depth=".05" aria-hidden="true">
              {drinks.map((d, n) => (
                <div key={d.slug} className={n === 0 ? "set on" : "set"} data-set={n}>
                  {layoutBits(d, n).map((b) => (
                    <div key={b.key} className="bit" style={b.style}>
                      <i
                        className={b.flat ? (n === 0 ? "in intro" : "in") : "in ph"}
                        style={b.innerStyle}
                        data-bit
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="splash glow" data-glow />
            <div className="splash ring" data-ring />

            <div className="layer" data-depth=".034">
              <div className="cupwrap" data-cupwrap>
                <div className="cuprise">
                  <div className="cuptilt">
                    <div className="cupfloat">
                      {drinks.map((d, i) => (
                        <div
                          key={d.slug}
                          className={i === 0 ? "cupslot is-active" : "cupslot"}
                          style={{ "--m": `url(${d.cup})` } as React.CSSProperties}
                          data-slot={i}
                        >
                          <Image
                            src={d.cup}
                            alt={`AVRO! ${d.name} in a clear cup with a black lid`}
                            width={464}
                            height={640}
                            sizes="(max-width: 820px) 60vw, 25vw"
                            priority={i === 0}
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

            <div className="layer sides" data-depth=".075" aria-hidden="true">
              {drinks.map(
                (d, i) =>
                  d.sides && (
                    <div key={d.slug} className={i === 0 ? "sideset on" : "sideset"} data-sideset={i}>
                      {d.sides.map(([src, x, w], k) => (
                        <div key={src} className={k ? "side r" : "side l"} style={{ left: u(x), width: u(w) }} data-side>
                          <i style={{ backgroundImage: `url(${src})` }} />
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
            <Image src="/brand/avro-logo.webp" alt="AVRO!" width={600} height={155} priority />
          </a>
          <div className="links">
            {SITE.nav.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>
          <div className="right">
            <a className="shop" href={SITE.shop.href}>
              {SITE.shop.label}
            </a>
            <button type="button" className="burger" aria-label="Open menu">
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
              onClick={() => scrollToDrink(i)}
              data-rail-item
            >
              <span className="num">0{i + 1}</span>
              <span className="nm">{d.name}</span>
              <span className="bar" />
            </button>
          ))}
          <i className="cue" />
        </div>
      </div>
    </div>
  );
}
