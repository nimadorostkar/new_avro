"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Drink } from "@/data/drinks";
import { SITE } from "@/lib/site";
import { scrollToDrink } from "./scene";

/**
 * The burger and the full-screen menu it opens. On narrow screens this is the
 * only way to the primary links and the drink names. State lives here so that
 * opening it never re-renders the hero markup the engine is animating, and the
 * panel is portalled to <body>: the animated nav would otherwise become its
 * containing block and clip it.
 */
export function Menu({ drinks }: { drinks: readonly Drink[] }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const trigger = button.current;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.documentElement.classList.add("menu-open");
    panel.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("menu-open");
      trigger?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        ref={button}
        type="button"
        className="burger"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(true)}
      >
        <span />
        <span />
        <span />
      </button>
      {open &&
        createPortal(
          <div id={id} ref={panel} className="menu" role="dialog" aria-modal="true" aria-label="Menu">
            <button type="button" className="menu-close" aria-label="Close menu" onClick={close}>
              <span />
              <span />
            </button>
            <nav className="menu-links" aria-label="Primary">
              {[...SITE.nav, SITE.shop].map((l, i) => (
                <a key={l.href} href={l.href} onClick={close} style={{ "--i": i } as React.CSSProperties}>
                  {l.label}
                </a>
              ))}
            </nav>
            <ul className="menu-drinks" aria-label="Drinks">
              {drinks.map((d, i) => (
                <li key={d.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      scrollToDrink(i);
                    }}
                  >
                    <span className="num">0{i + 1}</span>
                    {d.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
}
