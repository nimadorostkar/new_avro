import type { Drink } from "@/data/drinks";
import { SPRITES, type SpriteKey } from "@/data/sprites";
import { CUP_CENTER, SCENE, layoutBits, prefersReducedMotion, stepHeight, unit, type BitGeometry } from "./scene";

/*
 * The hero is rendered once by React (see Hero.tsx) and then driven here with
 * the Web Animations API, timers and a canvas. Everything this module touches is
 * found through `data-*` hooks so the markup and the motion stay decoupled.
 * `mountHero` returns a disposer that cancels every animation, timer and
 * listener, so it is safe under React Strict Mode and route changes.
 */

const OUT = "cubic-bezier(.6,0,.9,.3)";
const IN = "cubic-bezier(.17,1.22,.3,1)";
const SOFT = "cubic-bezier(.16,.84,.24,1)";
const TAU = 6.283185307179586;

type SetRef = { set: HTMLElement; items: { inner: HTMLElement; geometry: BitGeometry }[] };
type SideRef = { wrap: HTMLElement; els: HTMLElement[] } | null;

const q = <T extends HTMLElement>(root: ParentNode, sel: string): T => {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`hero: missing element ${sel}`);
  return el;
};
const qa = <T extends HTMLElement>(root: ParentNode, sel: string) => [...root.querySelectorAll<T>(sel)];

export function mountHero(root: HTMLElement, drinks: readonly Drink[]): () => void {
  const reduce = prefersReducedMotion();
  const first = drinks[0];
  if (!first) return () => {};

  /* ---- elements ---- */
  const cam = q(root, "[data-cam]");
  const cupwrap = q(root, "[data-cupwrap]");
  const drops = q(root, "[data-drops]");
  const ring = q(root, "[data-ring]");
  const glow = q(root, "[data-glow]");
  const sunEl = q(root, "[data-sun]");
  const word = q(root, "[data-word]");
  const note = q(root, "[data-note]");
  const title = q(root, "[data-title]");
  const rail = q(root, "[data-rail]");
  const railItems = qa<HTMLButtonElement>(rail, "[data-rail-item]");
  const calls = qa(root, "[data-call]");
  const tags = calls.map((c) => q(c, "[data-tag]"));
  const slots = drinks.map((_, i) => q(root, `[data-slot="${i}"]`));
  const bgs = drinks.map((_, i) => q(root, `[data-bg="${i}"]`));
  const flashes = bgs.map((bg) => bg.querySelector<HTMLElement>("[data-flash]"));
  const sets: SetRef[] = drinks.map((d, i) => {
    const set = q(root, `[data-set="${i}"]`);
    const inners = qa(set, "[data-bit]");
    return { set, items: layoutBits(d, i).map((b, k) => ({ inner: inners[k]!, geometry: b.geometry })) };
  });
  const sides: SideRef[] = drinks.map((d, i) => {
    if (!d.sides) return null;
    const wrap = q(root, `[data-sideset="${i}"]`);
    return { wrap, els: qa(wrap, "[data-side]") };
  });
  const layers = qa(root, "[data-depth]");
  const canvas = q<HTMLCanvasElement>(root, "[data-motes]");

  /* ---- bookkeeping so everything can be torn down ---- */
  let cur = 0;
  let zTop = 1;
  let timers: number[] = [];
  let live: Animation[] = [];
  const disposers: (() => void)[] = [];
  const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
  const anim = (el: Element, kf: Keyframe[], o: KeyframeAnimationOptions) => {
    const a = el.animate(kf, o);
    live.push(a);
    return a;
  };
  const on = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
    window.addEventListener(type, fn, opts);
    disposers.push(() => window.removeEventListener(type, fn, opts));
  };

  /* ---- text pieces ---- */
  const setWord = (txt: string, cls: string) => {
    word.replaceChildren();
    return [...txt].map((c, i) => {
      const s = document.createElement("span");
      s.className = "ch " + cls;
      s.textContent = c;
      s.style.setProperty("--dl", `${1.3 + i * 0.05}s`);
      word.appendChild(s);
      return s;
    });
  };
  const setNote = (d: Drink) => {
    const b = document.createElement("b");
    b.textContent = d.name;
    note.replaceChildren(b, d.note);
  };
  const setRail = (i: number) => {
    railItems.forEach((b, k) => b.setAttribute("aria-current", String(k === i)));
    rail.classList.toggle("end", i === drinks.length - 1);
  };
  const setTags = (d: Drink) => tags.forEach((t, k) => (t.textContent = d.tags[k] ?? ""));

  /* ---- air: pollen rising, leaves falling, confetti out of the cup ---- */
  let world: (n: number, instant: boolean, dir: number) => void = () => {};

  /* ---- the swap ---- */
  function go(n: number) {
    if (n === cur || n < 0 || n >= drinks.length) return;
    const dir = n > cur ? 1 : -1;
    const prev = cur;
    const from = slots[prev]!;
    const to = slots[n]!;
    const D = drinks[n]!;
    timers.forEach(clearTimeout);
    timers = [];
    live.forEach((a) => a.cancel());
    live = [];
    slots.forEach((s) => s.classList.remove("is-moving"));
    sets.forEach((S, k) => {
      S.items.forEach((b) => b.inner.classList.remove("intro"));
      S.set.classList.toggle("on", k === prev || k === n);
    });
    bgs.forEach((e, k) => e.classList.toggle("on", k === prev || k === n));
    sides.forEach((S, k) => S && S.wrap.classList.toggle("on", k === prev || k === n));
    cur = n;
    setRail(n);
    title.setAttribute("aria-label", "Taste the " + D.word.toLowerCase());
    sunEl.style.setProperty("--sun", D.sun);
    bgs[n]!.style.zIndex = String(++zTop);
    drops.style.opacity = "1";

    if (reduce) {
      slots.forEach((s, k) => s.classList.toggle("is-active", k === n));
      sets.forEach((S, k) => S.set.classList.toggle("on", k === n));
      sides.forEach((S, k) => S && S.wrap.classList.toggle("on", k === n));
      bgs.forEach((e, k) => e.classList.toggle("on", k === n));
      world(n, true, dir);
      setWord(D.word, "");
      setNote(D);
      setTags(D);
      return;
    }

    /* cups: old one is thrown off in the scroll direction, new one tumbles in and settles */
    from.classList.remove("is-active");
    from.classList.add("is-moving");
    anim(
      from,
      [
        { transform: "perspective(900px) translateY(0) rotate(0) rotateY(0) scale(1)", opacity: 1, filter: "blur(0px)" },
        {
          transform: `perspective(900px) translateY(${-dir * 120}%) rotate(${-dir * 26}deg) rotateY(${dir * 150}deg) scale(.58)`,
          opacity: 0,
          filter: "blur(7px)",
        },
      ],
      { duration: 720, easing: OUT },
    ).onfinish = () => from.classList.remove("is-moving");

    to.classList.add("is-active");
    anim(
      to,
      [
        {
          transform: `perspective(900px) translateY(${dir * 135}%) rotate(${dir * 34}deg) rotateY(${-dir * 200}deg) scale(.5)`,
          opacity: 0,
          filter: "blur(9px)",
        },
        { opacity: 1, filter: "blur(0px)", offset: 0.55 },
        { transform: "perspective(900px) translateY(0) rotate(0) rotateY(0) scale(1)", opacity: 1, filter: "blur(0px)" },
      ],
      { duration: 1250, delay: 240, easing: IN, fill: "backwards" },
    );

    /* the landscape changes through an iris that opens from the cup; the shockwave ring is its glowing edge */
    const T0 = 500;
    const TD = 1500;
    const irisAt = `${((CUP_CENTER.x / SCENE.w) * 100).toFixed(1)}% ${((CUP_CENTER.y / SCENE.h) * 100).toFixed(1)}%`;
    anim(bgs[n]!, [{ clipPath: `circle(0% at ${irisAt})` }, { clipPath: `circle(82% at ${irisAt})` }], {
      duration: TD,
      delay: T0,
      easing: SOFT,
      fill: "backwards",
    }).onfinish = () => bgs[prev]!.classList.remove("on");
    /* the iris first shows a splash of juice, which dissolves into the new landscape */
    const flash = flashes[n];
    if (flash) {
      anim(
        flash,
        [{ opacity: 1, transform: "scale(1.25)" }, { opacity: 1, offset: 0.35 }, { opacity: 0, transform: "scale(1)" }],
        { duration: 1900, delay: T0, easing: "ease-out", fill: "backwards" },
      );
    }
    ring.style.setProperty("--c", D.color);
    glow.style.setProperty("--c", D.color);
    anim(ring, [{ transform: "scale(0)", opacity: 1 }, { opacity: 0.9, offset: 0.5 }, { transform: "scale(6.9)", opacity: 0 }], {
      duration: TD,
      delay: T0,
      easing: SOFT,
    });
    anim(glow, [{ transform: "scale(.4)", opacity: 0.8 }, { transform: "scale(4.6)", opacity: 0 }], {
      duration: 1500,
      delay: T0,
      easing: SOFT,
    });

    /* camera whip */
    anim(cam, [{ transform: "none" }, { transform: `translateY(${-dir * 3.2}%) scale(1.07)`, offset: 0.38 }, { transform: "none" }], {
      duration: 1500,
      easing: "cubic-bezier(.4,0,.2,1)",
    });

    /* ingredients: the old ones are blasted out of frame, the new ones are thrown out of the cup */
    const u = unit();
    sets[prev]!.items.forEach(({ inner, geometry: g }, i) =>
      anim(
        inner,
        [
          { transform: "none", opacity: 1 },
          {
            transform: `translate(${g.ox * 420 * u}px,${(g.oy * 420 - dir * 160) * u}px) rotate(${g.sg * 320}deg) scale(.5)`,
            opacity: 0,
          },
        ],
        { duration: 760, delay: 380 + i * 18, easing: "cubic-bezier(.5,0,.9,.5)", fill: "forwards" },
      ),
    );
    later(() => {
      if (cur !== prev) sets[prev]!.set.classList.remove("on");
    }, 1300);
    sets[n]!.items.forEach(({ inner, geometry: g }, i) =>
      anim(
        inner,
        [
          {
            transform: `translate(${g.dx * 0.85 * u}px,${(g.dy * 0.85 + dir * 70) * u}px) rotate(${-g.sg * 300}deg) scale(.12)`,
            opacity: 0,
          },
          { opacity: 1, offset: 0.3 },
          { transform: "none", opacity: 1 },
        ],
        { duration: 1500, delay: 620 + i * 55, easing: IN, fill: "backwards" },
      ),
    );

    /* foreground plants: the old ones are pulled off the edges, the new ones grow in from the sides */
    const sidePrev = sides[prev];
    const sideNext = sides[n];
    if (sidePrev) {
      sidePrev.els.forEach((s, k) =>
        anim(s, [{ transform: "none", opacity: 1 }, { transform: `translateX(${k ? 22 : -22}%) scale(1.08)`, opacity: 0 }], {
          duration: 700,
          easing: OUT,
          fill: "forwards",
        }),
      );
      later(() => {
        if (cur !== prev) sidePrev.wrap.classList.remove("on");
      }, 800);
    }
    if (sideNext) {
      sideNext.els.forEach((s, k) =>
        anim(s, [{ transform: `translateX(${k ? 30 : -30}%) scale(1.12)`, opacity: 0 }, { transform: "none", opacity: 1 }], {
          duration: 1700,
          delay: 650 + k * 120,
          easing: SOFT,
          fill: "backwards",
        }),
      );
    }

    /* a sweep of light across the new cup once it lands */
    const sweep = to.querySelector("[data-sweep]");
    if (sweep) {
      anim(sweep, [{ backgroundPosition: "130% 0", opacity: 1 }, { backgroundPosition: "-30% 0", opacity: 1 }], {
        duration: 1000,
        delay: 1350,
        easing: "ease-in-out",
      });
    }

    world(n, false, dir);

    /* headline: letters leave one by one, new word climbs in */
    const old = [...word.children] as HTMLElement[];
    old.forEach((c, i) => {
      c.classList.remove("intro");
      anim(c, [{ transform: "none" }, { transform: `translateY(${-dir * 112}%)` }], {
        duration: 480,
        delay: i * 28,
        easing: "cubic-bezier(.7,0,.84,0)",
        fill: "forwards",
      });
    });
    later(
      () =>
        setWord(D.word, "").forEach((c, i) =>
          anim(c, [{ transform: `translateY(${dir * 112}%)` }, { transform: "none" }], {
            duration: 1000,
            delay: i * 45,
            easing: SOFT,
            fill: "backwards",
          }),
        ),
      480 + old.length * 28,
    );

    /* caption + callouts */
    anim(note, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateY(${-dir * 10}px)` }], {
      duration: 300,
      fill: "forwards",
    });
    later(() => {
      setNote(D);
      anim(note, [{ opacity: 0, transform: `translateY(${dir * 12}px)` }, { opacity: 1, transform: "none" }], {
        duration: 800,
        easing: SOFT,
        fill: "forwards",
      });
    }, 520);
    calls.forEach((c) => c.classList.remove("on"));
    later(() => setTags(D), 420);
    later(() => calls[0]?.classList.add("on"), 1250);
    later(() => calls[1]?.classList.add("on"), 1500);
  }

  /* ---- first paint: callouts draw themselves once the cup has risen ---- */
  later(() => calls[0]?.classList.add("on"), reduce ? 0 : 3500);
  later(() => calls[1]?.classList.add("on"), reduce ? 0 : 4100);

  /* ---- scroll position -> drink ---- */
  let raf = 0;
  const sync = () => {
    raf = 0;
    go(Math.max(0, Math.min(drinks.length - 1, Math.round(window.scrollY / stepHeight()))));
  };
  on("scroll", () => (raf = raf || requestAnimationFrame(sync)), { passive: true });
  sync();

  const dispose = () => {
    timers.forEach(clearTimeout);
    live.forEach((a) => a.cancel());
    if (raf) cancelAnimationFrame(raf);
    disposers.forEach((d) => d());
  };
  if (reduce) return dispose;

  /* ---- pointer parallax + a little 3D turn on the cup ---- */
  let tx = 0;
  let ty = 0;
  let px = 0;
  let py = 0;
  on(
    "pointermove",
    (e) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    },
    { passive: true },
  );
  on(
    "deviceorientation",
    (e) => {
      if (e.gamma == null || e.beta == null) return;
      tx = Math.max(-0.5, Math.min(0.5, e.gamma / 60));
      ty = Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 60));
    },
    { passive: true },
  );

  /* ---- air ---- */
  const g = canvas.getContext("2d");
  if (!g) return dispose;
  const IMG = {} as Record<SpriteKey, HTMLImageElement>;
  for (const k of Object.keys(SPRITES) as SpriteKey[]) {
    IMG[k] = new Image();
    IMG[k].src = SPRITES[k].src;
  }
  type Mote = { x: number; y: number; r: number; vx: number; vy: number; p: number };
  type Leaf = {
    x: number; y: number; s: number; vy: number; sw: number; a: number; va: number; f: number; vf: number;
    c: string; o: number; img: HTMLImageElement | null;
  };
  type Spark = Leaf & { vx: number; life: number };
  let W = 0;
  let H = 0;
  let dp = 1;
  let motes: Mote[] = [];
  let petals: Leaf[] = [];
  let sparks: Spark[] = [];
  let air: Drink = first;
  let airK = 1;
  let airTarget = 1;
  const pick = <T,>(arr: readonly T[]) => arr[(Math.random() * arr.length) | 0];
  const mkMote = (): Mote => ({
    x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 2.4 + 0.6) * dp,
    vx: (Math.random() - 0.3) * 0.18 * dp, vy: -(Math.random() * 0.25 + 0.05) * dp, p: Math.random() * TAU,
  });
  const mkPetal = (top: boolean): Leaf => ({
    x: Math.random() * W, y: top ? -20 : Math.random() * H, s: (Math.random() * 9 + 5) * dp,
    vy: (Math.random() * 0.7 + 0.35) * dp, sw: Math.random() * TAU, a: Math.random() * TAU, va: (Math.random() - 0.5) * 0.04,
    f: Math.random() * TAU, vf: Math.random() * 0.05 + 0.02, c: pick(air.petals ?? []) ?? "#fff", o: Math.random() * 0.5 + 0.45,
    img: air.fall ? IMG[pick(air.fall)!] : null,
  });
  const fill = () => {
    motes = Array.from({ length: air.motes }, mkMote);
    petals = air.petals?.length || air.fall ? Array.from({ length: air.fall ? 12 : 16 }, () => mkPetal(false)) : [];
  };
  const size = () => {
    const r = canvas.getBoundingClientRect();
    dp = Math.min(window.devicePixelRatio || 1, 1.5);
    W = canvas.width = r.width * dp;
    H = canvas.height = r.height * dp;
    fill();
  };
  size();
  on("resize", size);
  world = (n, instant) => {
    airTarget = 0;
    later(() => {
      air = drinks[n]!;
      fill();
      airTarget = 1;
    }, 520);
    if (instant) return;
    later(() => {
      // confetti out of the cup in the new drink's colours
      const D = drinks[n]!;
      const cols = D.petals?.length ? D.petals : ["#f0d29a", "#8a5a2b", "#c8202a"];
      const ox = W * (CUP_CENTER.x / SCENE.w);
      const oy = H * (CUP_CENTER.y / SCENE.h);
      for (let i = 0, N = D.fall ? 26 : 38; i < N; i++) {
        const an = Math.random() * TAU;
        const sp = (Math.random() * 9 + 4) * dp;
        sparks.push({
          x: ox, y: oy, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp - 3 * dp, s: (Math.random() * 8 + 4) * dp,
          a: an, va: (Math.random() - 0.5) * 0.3, f: 0, vf: Math.random() * 0.2 + 0.1, c: cols[i % cols.length]!, life: 1,
          sw: 0, o: 1, img: D.fall ? IMG[D.fall[i % D.fall.length]!] : null,
        });
      }
    }, 700);
  };
  const leafy = (p: Leaf, alpha: number) => {
    if (p.img) {
      if (!p.img.complete || !p.img.naturalWidth) return;
      const w = p.s * 2.2;
      const h = (w * p.img.height) / p.img.width;
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.a);
      g.globalAlpha = Math.min(1, alpha * 1.4);
      g.drawImage(p.img, -w / 2, -h / 2, w, h);
      g.restore();
      return;
    }
    g.save();
    g.translate(p.x, p.y);
    g.rotate(p.a);
    g.scale(1, Math.cos(p.f) * 0.85 + 0.15 * Math.sign(Math.cos(p.f) || 1));
    g.globalAlpha = alpha;
    g.fillStyle = p.c;
    g.beginPath();
    g.moveTo(0, -p.s);
    g.quadraticCurveTo(p.s * 0.75, 0, 0, p.s);
    g.quadraticCurveTo(-p.s * 0.75, 0, 0, -p.s);
    g.fill();
    g.restore();
  };

  /* ---- the frame loop: parallax, cup tilt and the air ---- */
  let frame = 0;
  const t0 = performance.now();
  const tick = (now: number) => {
    px += (tx - px) * 0.05;
    py += (ty - py) * 0.05;
    const w = window.innerWidth;
    for (const l of layers) {
      const dd = Number(l.dataset.depth);
      l.style.transform = `translate3d(${-px * w * dd}px,${-py * w * dd * 0.6}px,0)`;
    }
    cupwrap.style.transform = `perspective(1200px) rotateY(${px * 16}deg) rotateX(${-py * 9}deg)`;

    g.clearRect(0, 0, W, H);
    airK += (airTarget - airK) * 0.08;
    const k = Math.min(1, (now - t0) / 4000) * airK;
    const [mr, mg, mb] = air.mote;
    for (const m of motes) {
      m.x += m.vx;
      m.y += m.vy;
      m.p += 0.012;
      if (m.y < -10) {
        m.y = H + 10;
        m.x = Math.random() * W;
      }
      if (m.x > W + 10) m.x = -10;
      const a = (0.25 + 0.25 * Math.sin(m.p)) * k;
      const gr = g.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 3);
      gr.addColorStop(0, `rgba(${mr},${mg},${mb},${a})`);
      gr.addColorStop(1, `rgba(${mr},${mg},${mb},0)`);
      g.fillStyle = gr;
      g.beginPath();
      g.arc(m.x, m.y, m.r * 3, 0, TAU);
      g.fill();
    }
    for (const p of petals) {
      p.sw += 0.015;
      p.a += p.va;
      p.f += p.vf;
      p.y += p.vy;
      p.x += Math.sin(p.sw) * 0.6 * dp - px * 2;
      if (p.y > H + 20) Object.assign(p, mkPetal(true));
      leafy(p, p.o * k);
    }
    for (let i = sparks.length; i--; ) {
      const p = sparks[i]!;
      p.vx *= 0.965;
      p.vy = p.vy * 0.965 + 0.16 * dp;
      p.x += p.vx;
      p.y += p.vy;
      p.a += p.va;
      p.f += p.vf;
      p.life -= 0.011;
      if (p.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      leafy(p, Math.min(1, p.life * 2));
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    dispose();
  };
}
