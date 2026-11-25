"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Short intro curtain. The page content is already in the HTML underneath it, so this never gates anything:
 * it lifts as soon as scripts have run and fonts are ready (not on window "load", which waits for every
 * image), after at least ~0.5s so the bar can be seen, and a CSS animation clears it if scripts never run.
 * The bar and the counter are updated directly on the DOM, so there is no React re-render per frame.
 */
export function Preloader() {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(false);
  const bar = useRef<HTMLSpanElement>(null);
  const count = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const started = performance.now();
    const minimum = reduced ? 120 : 520;
    let finished = false;
    let raf = 0;
    let timer = 0;

    const paint = (v: number) => {
      bar.current?.style.setProperty("--p", String(v));
      if (count.current) count.current.textContent = String(Math.round(v * 100)).padStart(3, "0");
    };
    const tick = (now: number) => {
      paint(Math.min(0.92, (now - started) / minimum));
      if (!finished) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      paint(1);
      timer = window.setTimeout(
        () => {
          setDone(true);
          root.classList.add("is-loaded");
        },
        Math.max(0, minimum - (performance.now() - started)),
      );
    };

    const fonts = document.fonts?.ready ?? Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, 900))]).then(finish);
    const failsafe = window.setTimeout(finish, 1800);
    return () => {
      finished = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.clearTimeout(failsafe);
    };
  }, [reduced]);

  return (
    <div className={`preloader ${done ? "is-done" : ""}`} aria-hidden={done} role="status" aria-label="Loading">
      <p className="preloader-name">{profile.name}</p>
      <span className="preloader-line" aria-hidden>
        <span ref={bar} />
      </span>
      <p ref={count} className="preloader-count" aria-hidden>
        000
      </p>
    </div>
  );
}
