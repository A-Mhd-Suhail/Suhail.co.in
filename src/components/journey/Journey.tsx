"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { beyond } from "@/content/beyond";
import { network } from "@/content/network";
import { publicProjects, type Project } from "@/content/projects";
import { ProfilePhoto } from "../beyond/ProfilePhoto";
import type { JourneyCtl } from "./JourneyScene";
import "./journey.css";

const WorldMap = dynamic(() => import("../beyond/WorldMap"));
const JourneyScene = dynamic(() => import("./JourneyScene"), { ssr: false });

/**
 * ONE continuous scroll journey, one pinned stage, one map, one 3D scene:
 * visiting card -> map draws once -> About (4 moments) -> map pulls back into Earth -> flight to the Moon
 * -> MoonNav -> panel turns -> Naji Learning -> panel turns -> United Medication.
 * Scroll position becomes a single number (t, 0 to 1) and every visual state is derived from it, so scrolling
 * backwards restores each state exactly and nothing is drawn twice.
 */

const TRAVEL = 11; // scroll length after the iris, in viewport heights
const PIN = 0.7; // the stage is pinned (but still masked) from this point of the hero's scroll
const IRIS_A = 0.74; // hero progress at which the map environment starts to open
const IRIS_B = 0.94; // ...and is fully open

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const win = (t: number, a: number, b: number, f = 0.02) => clamp((t - a) / f) * clamp((b - t) / f);

/** About moments: [in, out] on the journey timeline. */
const MOMENTS: [number, number][] = [
  [0.03, 0.14],
  [0.15, 0.26],
  [0.27, 0.38],
  [0.39, 0.5],
];
const PULL = [0.5, 0.59] as const; // map pulls back into Earth
const FLY = [0.57, 0.71] as const; // Earth to the first project world
const HOP1 = [0.77, 0.82] as const; // first world to second (while the panel turns)
const HOP2 = [0.87, 0.92] as const; // second world to third
/** Project panels: [turns in, turns out]. Each turn takes 0.02. */
const PROJECTS: [number, number][] = [
  [0.7, 0.78],
  [0.8, 0.88],
  [0.9, 9],
];

const statusLabel = { completed: "Completed", "in-progress": "In progress", prototype: "Prototype" } as const;

export function Journey() {
  const root = useRef<HTMLElement>(null);
  const ctl = useRef<JourneyCtl>({ u1: 0, s: 0 });
  const [scene, setScene] = useState(false);
  const [moment, setMoment] = useState(-1);
  const [proj, setProj] = useState(-1);
  const [still, setStill] = useState(false);

  const all = publicProjects();
  const stops = network.stops
    .map((s) => ({ ...s, project: all.find((p) => p.slug === s.slug) }))
    .filter((s): s is typeof s & { project: Project } => !!s.project);

  const [gl, setGl] = useState(true);
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setStill(true);
    try {
      const c = document.createElement("canvas");
      if (!(c.getContext("webgl2") || c.getContext("webgl"))) setGl(false);
    } catch {
      setGl(false);
    }
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
    let sceneOn = false;
    let mom = -1;
    let pj = -1;

    const layout = () => {
      // Overlap the end of the hero so the pinned stage is already in place when the map opens.
      const vh = window.innerHeight;
      const Hh = hero.offsetHeight;
      const range = Math.max(1, Hh - vh);
      const sPin = PIN * range;
      const sIris = IRIS_B * range;
      el.style.marginTop = `${-(Hh - sPin)}px`;
      el.style.height = `${sIris - sPin + TRAVEL * vh + vh}px`;
      // Anchor targets for the menu: About starts as the map is drawn, Work starts with the Moon.
      const base = sIris - sPin;
      el.style.setProperty("--a1-top", `${base + 0.04 * TRAVEL * vh}px`);
      el.style.setProperty("--a1-h", `${0.5 * TRAVEL * vh}px`);
      el.style.setProperty("--a2-top", `${base + 0.73 * TRAVEL * vh}px`);
      el.style.setProperty("--a2-h", `${0.27 * TRAVEL * vh + vh}px`);
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
      set("--bp", clamp(t / 0.5));

      const c1 = smooth(clamp((t - PULL[0]) / (PULL[1] - PULL[0])));
      set("--c1", c1);
      ctl.current.u1 = clamp((t - PULL[0]) / (PULL[1] - PULL[0]));
      ctl.current.s = clamp((t - FLY[0]) / (FLY[1] - FLY[0])) + clamp((t - HOP1[0]) / (HOP1[1] - HOP1[0])) + clamp((t - HOP2[0]) / (HOP2[1] - HOP2[0]));

      MOMENTS.forEach(([a, b], i) => set(`--m${i}`, win(t, a, b)));
      PROJECTS.forEach(([a, b], i) => {
        const deg = 90 * (1 - clamp((t - a) / 0.02)) - 90 * clamp((t - b) / 0.02);
        set(`--ry${i}`, deg, 2);
      });

      const m = MOMENTS.findIndex(([a, b]) => t >= a && t < b);
      if (m !== mom) {
        mom = m;
        setMoment(m);
      }
      const p = PROJECTS.reduce((acc, [a, b], i) => (t >= a + 0.01 && t < b + 0.01 ? i : acc), -1);
      if (p !== pj) {
        pj = p;
        setProj(p);
      }
      el.dataset.live = String(io > 0 && t < 1.001);
      el.dataset.map = c1 >= 0.999 ? "off" : "on";
      el.dataset.iris = io >= 0.999 ? "open" : "opening";

      // Mount the 3D scene a little before it is needed, and redraw it only when its inputs change.
      if (!sceneOn && t > 0.34) {
        sceneOn = true;
        setScene(true);
      }
      ctl.current.invalidate?.();
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
  const active = (i: number) => still || proj === i;

  return (
    <section ref={root} id="journey" className="jr" data-tone="dark" data-still={still ? "true" : "false"} data-gl={gl ? "on" : "off"} data-iris="opening" data-map="on" aria-label="About and selected work">
      <span id="beyond" className="jr-anchor" style={{ top: "var(--a1-top)", height: "var(--a1-h)" }} aria-hidden />
      <span id="things-i-build" className="jr-anchor" style={{ top: "var(--a2-top)", height: "var(--a2-h)" }} aria-hidden />
      <div className="jr-stage">
        <div className="jr-bg" aria-hidden />

        <div className="jr-3d" aria-hidden>
          {scene && !still && gl && <JourneyScene ctl={ctl.current} />}
        </div>

        <div className="jr-map" aria-hidden>
          <WorldMap />
        </div>
        <div className="jr-scrim" aria-hidden />

        <p className="jr-label jr-label-about" aria-hidden>
          {beyond.title}
        </p>
        <p className="jr-label jr-label-work" aria-hidden>
          Selected work
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

        <div className="jr-photo">
          <ProfilePhoto />
        </div>


        {/* ───── Projects: one presentation system, three panels that turn ───── */}
        {stops.map((s, i) => {
          const p = s.project;
          const shot = p.screenshots[0];
          const on = active(i);
          return (
            <div key={s.slug} className={`jr-proj jr-proj-${i}`} style={{ "--ry": `var(--ry${i})` } as CSSProperties} data-on={on} {...(on ? {} : { inert: true })}>
              <div className="jr-pt">
                <p className="bp-label">
                  <span className="nw-no">{String(i + 1).padStart(2, "0")}</span> {p.tag ?? p.category}
                </p>
                <h3 className="bp-name nw-name">{p.name}</h3>
                <p className="nw-headline">{p.headline}</p>
                <p className="bp-text">{s.blurb}</p>
                {p.status && (
                  <p className="nw-status">
                    <i aria-hidden /> {statusLabel[p.status]}
                  </p>
                )}
                <div className="nw-actions">
                  <a className="nw-btn nw-btn-main" href={`/work/${p.slug}`}>
                    Explore project
                  </a>
                  {p.links.demo && (
                    <a className="nw-btn" href={p.links.demo} target="_blank" rel="noopener noreferrer">
                      Live demo
                    </a>
                  )}
                  {p.links.repo && (
                    <a className="nw-btn" href={p.links.repo} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  )}
                </div>
              </div>
              {shot && (
                <a className="jr-shot" href={`/work/${p.slug}`} tabIndex={-1} aria-hidden style={{ aspectRatio: `${shot.width} / ${shot.height}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={shot.src} alt="" width={shot.width} height={shot.height} loading="lazy" decoding="async" />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
