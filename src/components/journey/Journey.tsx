"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { beyond } from "@/content/beyond";
import { ProfilePhoto } from "../beyond/ProfilePhoto";
import "./journey.css";

// The map is decorative and hidden until the intro opens: render it on the client so it adds nothing to the HTML.
const WorldMap = dynamic(() => import("../beyond/WorldMap"), { ssr: false });

/**
 * One scroll scene: visiting card -> the world map opens and draws once -> About, in four moments.
 * Scroll position becomes a single number (t, 0 to 1) and every visual state is derived from it, so scrolling
 * backwards restores each state exactly and nothing is drawn twice. The projects follow on a plain white page.
 */

const TRAVEL = 5; // scroll length after the iris, in viewport heights
const PIN = 0.7; // the stage is pinned (but still masked) from this point of the hero's scroll
const IRIS_A = 0.74; // hero progress at which the map environment starts to open
const IRIS_B = 0.94; // ...and is fully open

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const win = (t: number, a: number, b: number, f = 0.04) => clamp((t - a) / f) * clamp((b - t) / f);

/** About moments: [in, out] on the timeline. The last one stays until the white page covers it. */
const MOMENTS: [number, number][] = [
  [0.02, 0.26],
  [0.27, 0.51],
  [0.52, 0.76],
  [0.77, 9],
];

export function Journey() {
  const root = useRef<HTMLElement>(null);
  const [about, setAbout] = useState(false);
  const [moment, setMoment] = useState(-1);
  const [still, setStill] = useState(false);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setStill(true);
  }, []);

  useEffect(() => {
    const el = root.current;
    const hero = document.getElementById("home");
    if (!el || !hero || still) return;

    let raf = 0;
    const last: Record<string, string> = {};
    const set = (k: string, v: number, digits = 4) => {
      const s = v.toFixed(digits);
      if (last[k] !== s) {
        last[k] = s;
        el.style.setProperty(k, s);
      }
    };
    let aboutOn = false;
    let mom = -1;

    const layout = () => {
      // Overlap the end of the hero so the pinned stage is already in place when the map opens.
      const vh = window.innerHeight;
      const Hh = hero.offsetHeight;
      const range = Math.max(1, Hh - vh);
      const sPin = PIN * range;
      const sIris = IRIS_B * range;
      el.style.marginTop = `${-(Hh - sPin)}px`;
      el.style.height = `${sIris - sPin + TRAVEL * vh + vh}px`;
      // Anchor target for the menu: About starts as the map is drawn.
      const base = sIris - sPin;
      el.style.setProperty("--a1-top", `${base + 0.06 * TRAVEL * vh}px`);
      el.style.setProperty("--a1-h", `${0.94 * TRAVEL * vh + vh}px`);
    };

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const range = Math.max(1, hero.offsetHeight - vh);
      const S = window.scrollY;
      const io = clamp((S / range - IRIS_A) / (IRIS_B - IRIS_A));
      const t = clamp((S - IRIS_B * range) / (TRAVEL * vh));

      set("--io", io);
      set("--mp", smooth(io)); // the map is drawn once, while the iris opens
      set("--jt", t);
      set("--bp", t);
      MOMENTS.forEach(([a, b], i) => set(`--m${i}`, win(t, a, b)));

      const m = MOMENTS.findIndex(([a, b]) => t >= a && t < b);
      if (m !== mom) {
        mom = m;
        setMoment(m);
      }
      el.dataset.live = String(io > 0 && t < 1.001);
      el.dataset.iris = io >= 0.999 ? "open" : "opening";

      // The portrait is only requested once the intro starts to open.
      if (!aboutOn && io > 0.02) {
        aboutOn = true;
        setAbout(true);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      layout();
      onScroll();
    };

    layout();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // Fonts and images can change the hero's height after first paint.
    const ro = new ResizeObserver(onResize);
    ro.observe(hero);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [still]);

  const { identity, interests, journey, focus } = beyond;

  return (
    <section ref={root} id="journey" className="jr" data-tone="dark" data-own-reveal="" data-still={still ? "true" : "false"} data-iris="opening" aria-label="About">
      <span id="beyond" className="jr-anchor" style={{ top: "var(--a1-top)", height: "var(--a1-h)" }} aria-hidden />
      <div className="jr-stage">
        <div className="jr-bg" aria-hidden />

        <div className="jr-map" aria-hidden>
          <WorldMap />
        </div>
        <div className="jr-scrim" aria-hidden />

        <p className="jr-label" aria-hidden>
          {beyond.title}
        </p>

        {/* ───── About: four moments in one scene ───── */}
        <div className="jr-copy">
          <div className="jr-m jr-m0" inert={!still && moment !== 0 ? true : undefined}>
            <p className="bp-label">{identity.label}</p>
            <h2 className="bp-name">{identity.name}</h2>
            <p className="bp-text">{identity.text}</p>
            <p className="bp-text jr-gap">{identity.text2}</p>
          </div>

          <div className="jr-m jr-m1" inert={!still && moment !== 1 ? true : undefined}>
            <h3 className="bp-journey">{interests.label}</h3>
            <ul className="jr-terms">
              {interests.items.map((t, i) => (
                <li key={t} tabIndex={0}>
                  <span className="bp-idx">{String(i + 1).padStart(2, "0")}</span>
                  <span className="jr-term">{t}</span>
                </li>
              ))}
            </ul>
            <p className="bp-text jr-gap">{interests.productLead}</p>
            <ul className="jr-chips">
              {interests.product.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

          <div className="jr-m jr-m2" inert={!still && moment !== 2 ? true : undefined}>
            <h3 className="bp-journey">{journey.headline}</h3>
            <p className="bp-text">{journey.text}</p>
            <p className="bp-text jr-gap">{journey.team}</p>
          </div>

          <div className="jr-m jr-m3" inert={!still && moment !== 3 ? true : undefined}>
            <p className="bp-label">{focus.label}</p>
            <p className="bp-focus">{focus.name}</p>
            <a className="bp-link" href={focus.href}>
              {focus.cta}
            </a>
          </div>
        </div>

        <div className="jr-photo">{(about || still) && <ProfilePhoto />}</div>
      </div>
    </section>
  );
}
