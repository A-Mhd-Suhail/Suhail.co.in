"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { useScene } from "@/lib/useScene";
import { usePaused } from "@/lib/motionStore";
import { SculptureFallback } from "./SculptureFallback";

type SceneComponent = typeof import("./AndroidScene").default;

/** Centre statement. The name stays in the header wordmark and the screen-reader heading. */
const LINES = ["Imagine. Innovate.", "Build beyond the boundaries."];

export function Hero() {
  const host = useRef<HTMLElement>(null);
  const s = useScene(host);
  const paused = usePaused();
  const [Scene, setScene] = useState<SceneComponent | null>(null);
  const { gl, onLost } = s;

  // Load the 3D bundle only when WebGL exists. If the download fails, show the static drawing.
  useEffect(() => {
    if (gl !== "ok") return;
    let cancelled = false;
    import("./AndroidScene")
      .then((m) => !cancelled && setScene(() => m.default))
      .catch(() => !cancelled && onLost());
    return () => {
      cancelled = true;
    };
  }, [gl, onLost]);

  // Scroll progress through the hero (0 to 1) drives the title fade in CSS.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const total = Math.max(1, el.offsetHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total));
      el.style.setProperty("--p", p.toFixed(4));
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

        <div className={`hero2-stage ${s.ready || s.gl === "unavailable" ? "is-ready" : ""}`} aria-hidden>
          {s.gl === "ok" && Scene && (
            <Scene pointer={s.pointer} reduced={s.reduced} active={s.active} paused={paused} onReady={s.onReady} onLost={s.onLost} />
          )}
          {s.gl === "unavailable" && <SculptureFallback />}
        </div>

        <h1 className="hero2-title">
          <span className="sr-only">{profile.name}. Imagine. Innovate. Build beyond the boundaries.</span>
          {LINES.map((line, i) => (
            <span className="hero2-line" key={line} aria-hidden style={{ ["--i" as string]: i }}>
              <span>{line}</span>
            </span>
          ))}
        </h1>

        <p className="hero2-name">{profile.name}</p>

        <p className="hero2-meta rise" style={{ ["--d" as string]: 0.9 }}>
          {profile.roles.join(" · ")} · {profile.contact.country}
        </p>

        <p className="hero2-scroll" aria-hidden>
          Scroll to enter
        </p>
      </div>
    </section>
  );
}
