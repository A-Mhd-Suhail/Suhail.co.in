"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getTier } from "@/lib/deviceTier";
import { useScene } from "@/lib/useScene";
import { CardFallback } from "./CardFallback";

type SceneComponent = typeof import("./CardScene").default;

/** Centre statement. The name stays in the header wordmark and the screen-reader heading. */
const LINES = ["Imagine. Innovate.", "Build beyond the boundaries."];

export function Hero() {
  const host = useRef<HTMLElement>(null);
  const s = useScene(host);
  const [Scene, setScene] = useState<SceneComponent | null>(null);
  const [covered, setCovered] = useState(false);
  const { gl, onLost } = s;

  // The static card is in the HTML from the first byte. The 3D bundle is fetched after hydration, when the
  // browser is idle (and after the load event on slow or data-saver connections), then fades in over it.
  useEffect(() => {
    if (gl !== "ok") return;
    let cancelled = false;
    let idle = 0;
    let timer = 0;
    const load = () =>
      import("./CardScene")
        .then((m) => !cancelled && setScene(() => m.default))
        .catch(() => !cancelled && onLost());
    const start = () => {
      if (cancelled) return;
      // Weaker devices get a longer head start for hydration and first scrolling before the 3D bundle runs.
      const tier = getTier();
      const lead = tier === "low" ? 2600 : tier === "mid" ? 700 : 0;
      timer = window.setTimeout(() => {
        if (cancelled) return;
        if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(load, { timeout: 1500 });
        else load();
      }, lead);
    };
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = !!conn?.saveData || /(^|-)2g|3g/.test(conn?.effectiveType ?? "");
    if (slow && document.readyState !== "complete") window.addEventListener("load", start, { once: true });
    else start();
    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
      window.clearTimeout(timer);
      if (idle && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
    };
  }, [gl, onLost]);

  // Scroll progress through the hero (0 to 1) drives the title fade in CSS.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let raf = 0;
    let hidden = false;
    const update = () => {
      raf = 0;
      const total = Math.max(1, el.offsetHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total));
      el.style.setProperty("--p", p.toFixed(4));
      // From here the next section covers the whole screen, so the 3D card stops rendering behind it.
      if (p >= 0.945 !== hidden) {
        hidden = !hidden;
        setCovered(hidden);
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

  return (
    <section id="home" ref={host} className="hero2" data-tone="dark" aria-label="Introduction">
      <div className="hero2-sticky">
        <div className="hero2-bg" aria-hidden>
          <div className="hero2-halo" />
          <div className="hero2-glow" />
        </div>

        <div className="hero2-stage is-ready" data-3d={s.ready && s.gl === "ok" ? "true" : "false"} aria-hidden>
          <CardFallback />
          {s.gl === "ok" && Scene && (
            <ErrorBoundary onError={s.onLost}>
              <Scene pointer={s.pointer} reduced={s.reduced} active={s.active && (s.reduced || !covered)} onReady={s.onReady} onLost={s.onLost} />
            </ErrorBoundary>
          )}
        </div>

        <div className="hx-copy">
          <h1 className="hx-title">
            <span className="sr-only">{profile.name}. Imagine. Innovate. Build beyond the boundaries.</span>
            {LINES.map((line, i) => (
              <span className="hero2-line" key={line} aria-hidden style={{ ["--i" as string]: i }}>
                <span>{line}</span>
              </span>
            ))}
          </h1>
          <hr className="hx-rule rise" style={{ ["--d" as string]: 0.55 }} />
          <p className="hx-name rise" style={{ ["--d" as string]: 0.7 }}>
            {profile.name}
          </p>
        </div>

        <p className="hero2-scroll" aria-hidden>
          Scroll to enter
        </p>

      </div>
    </section>
  );
}
