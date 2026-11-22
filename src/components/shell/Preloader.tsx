"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";

/**
 * Lusion-style loader: a thin bar fills left to right while a percentage counts up in the corner.
 * It waits for the page and fonts (never less than ~0.9s, never more than 3s), then the panel lifts
 * away and sets html.is-loaded so the hero can animate in. A CSS animation clears it if scripts never run.
 */
export function Preloader() {
  const reduced = useReducedMotion() ?? false;
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const started = performance.now();
    const minimum = reduced ? 150 : 900;
    let finished = false;
    let raf = 0;
    let end = 0;

    // Progress eases towards 100 while we wait; it snaps to 100 when the page is ready.
    const tick = (now: number) => {
      const target = finished ? 1 : Math.min(0.92, (now - started) / minimum);
      const value = finished ? 1 : target;
      const shown = Math.round(value * 100);
      setPct(shown);
      if (bar.current) bar.current.style.setProperty("--p", String(value));
      if (!finished || now < end) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const finish = () => {
      if (finished) return;
      finished = true;
      const wait = Math.max(0, minimum - (performance.now() - started));
      end = performance.now() + wait;
      window.setTimeout(() => {
        setDone(true);
        root.classList.add("is-loaded");
      }, wait);
    };

    const ready = () => Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 1800))]);
    const onLoaded = () => ready().then(finish);
    if (document.readyState === "complete") onLoaded();
    else window.addEventListener("load", onLoaded, { once: true });

    const failsafe = window.setTimeout(() => {
      finished = false;
      finish();
    }, 3000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
      window.removeEventListener("load", onLoaded);
    };
  }, [reduced]);

  return (
    <div className={`preloader ${done ? "is-done" : ""}`} aria-hidden={done} role="status" aria-label="Loading">
      <p className="preloader-name">{profile.name}</p>
      <span className="preloader-line" aria-hidden>
        <span ref={bar} />
      </span>
      <p className="preloader-count" aria-hidden>
        {String(pct).padStart(3, "0")}
      </p>
    </div>
  );
}
