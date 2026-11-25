"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { beyond } from "@/content/beyond";
import { ProfilePhoto } from "./ProfilePhoto";

const WorldMap = dynamic(() => import("./WorldMap"));

/** Scroll stages (section progress) at which each reveal is the active one. */
const STAGES = [0.05, 0.36, 0.6, 0.8];

/**
 * "Beyond the profile": a pinned stage whose scroll progress (--bp, 0 to 1) draws the world map, lights the
 * nodes and brings in four pieces of copy one at a time. Hero.tsx shows the same environment through its
 * portal at --bp = 0, so the card flows into this stage without a cut.
 */
export function Beyond() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // stylesheet shows everything, still
    let raf = 0;
    let stage = 0;
    const update = () => {
      raf = 0;
      const total = Math.max(1, el.offsetHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total));
      el.style.setProperty("--bp", p.toFixed(4));
      const s = STAGES.filter((t) => p >= t).length;
      if (s !== stage) {
        stage = s;
        el.dataset.stage = String(s);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const { identity, interests, journey, focus } = beyond;
  return (
    <section ref={root} id="beyond" className="beyond" data-tone="dark" data-stage="0" aria-labelledby="beyond-title">
      <div className="beyond-sticky">
        <div className="beyond-bg" aria-hidden />
        <div className="beyond-map" aria-hidden>
          <WorldMap />
        </div>
        <div className="beyond-scrim" aria-hidden />
        <div className="sig-rings sig-rings-beyond" aria-hidden>
          <i />
          <i />
          <i />
        </div>

        <h2 id="beyond-title" className="beyond-title">
          {beyond.title}
        </h2>

        <div className="beyond-copy">
          <div className="rv" style={{ "--a": 0.05, "--b": 0.33 } as React.CSSProperties}>
            <p className="bp-label">{identity.label}</p>
            <h3 className="bp-name">{identity.name}</h3>
            {identity.lines.map((l) => (
              <p key={l} className="bp-line">
                {l}
              </p>
            ))}
          </div>

          <div className="rv" style={{ "--a": 0.36, "--b": 0.58 } as React.CSSProperties}>
            <p className="bp-label">{interests.label}</p>
            <ol className="bp-terms">
              {interests.items.map((t, i) => (
                <li key={t}>
                  <span className="bp-idx">{String(i + 1).padStart(2, "0")}</span>
                  <span className="bp-term">{t}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rv" style={{ "--a": 0.6, "--b": 0.78 } as React.CSSProperties}>
            <h3 className="bp-journey">{journey.headline}</h3>
            <p className="bp-text">{journey.text}</p>
          </div>

          <div className="rv rv-focus" style={{ "--a": 0.8, "--b": 9 } as React.CSSProperties}>
            <p className="bp-label">{focus.label}</p>
            <p className="bp-lead">{focus.lead}</p>
            <p className="bp-focus">{focus.name}</p>
            <a className="bp-link" href={focus.href}>
              {focus.cta}
              <span aria-hidden> →</span>
            </a>
          </div>
        </div>

        <div className="beyond-pager" aria-hidden>
          <i />
          <i />
          <i />
          <i />
        </div>

        <div className="beyond-photo">
          <ProfilePhoto />
        </div>
      </div>
    </section>
  );
}
