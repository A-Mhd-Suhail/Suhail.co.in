"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * A ticker that drifts on its own and speeds up (and reverses) with your scrolling.
 * One rAF loop that only runs while the ticker is on screen and the tab is visible.
 * Decorative: hidden from assistive tech; static for reduced motion.
 */
export function Marquee({ items }: { items: string[] }) {
  const reduced = useReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    const tr = track.current;
    if (reduced || !el || !tr) return;
    let visible = false;
    let raf = 0;
    let last = 0;
    let pos = 0;
    let dir = 1;
    let smooth = 0;
    let lastY = window.scrollY;

    const tick = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) {
        last = 0;
        return;
      }
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      const y = window.scrollY;
      const v = ((y - lastY) / Math.max(1, dt)) * 1000; // px per second
      lastY = y;
      smooth += (v - smooth) * Math.min(1, dt / 90);
      const boost = (smooth / 1000) * 4;
      if (boost < -0.05) dir = -1;
      else if (boost > 0.05) dir = 1;
      const move = dir * 1.6 * (dt / 1000);
      pos += move + dir * Math.abs(boost) * move;
      const w = ((((pos + 25) % 25) + 25) % 25) - 25; // wraps within -25%..0%
      tr.style.transform = `translate3d(${w}%,0,0)`;
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        lastY = window.scrollY;
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(el);
    const onVis = () => {
      if (!document.hidden && visible && !raf) raf = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const group = (
    <div className="marquee-group">
      {items.map((t, i) => (
        <span key={t} className="marquee-item">
          <span className={i % 2 ? "is-outline" : ""}>{t}</span>
          <span className="marquee-dot" />
        </span>
      ))}
    </div>
  );

  return (
    <div ref={host} className="marquee" aria-hidden>
      <div ref={track} className="marquee-track">
        {group}
        {group}
        {group}
        {group}
      </div>
    </div>
  );
}
