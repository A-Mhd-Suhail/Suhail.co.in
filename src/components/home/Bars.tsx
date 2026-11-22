"use client";

import { useEffect, useRef, useState } from "react";

const HEIGHTS = [22, 34, 28, 46, 40, 58, 52, 70, 62, 80, 74, 88, 66, 92, 84, 60, 72, 50, 64, 44, 56];
const BUILT = 14; // the rest are unfinished outlines

/**
 * "Something is taking shape": bars grow in when scrolled into view and rise gently
 * towards the cursor. Decorative only.
 */
export function Bars({ className = "" }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bars = Array.from(el.children) as HTMLElement[];
    let timer: number | undefined;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      window.clearTimeout(timer);
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      bars.forEach((b, i) => {
        const bx = b.offsetLeft + b.offsetWidth / 2;
        const near = Math.exp(-(((x - bx) / 70) ** 2));
        b.style.height = `${Math.min(100, HEIGHTS[i] + near * 16)}%`;
      });
      timer = window.setTimeout(() => bars.forEach((b, i) => (b.style.height = `${HEIGHTS[i]}%`)), 1200);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.clearTimeout(timer);
    };
  }, [inView]);

  return (
    <div ref={root} className={`bars ${inView ? "is-in" : ""} ${className}`} aria-hidden>
      {HEIGHTS.map((h, i) => (
        <span key={i} className={i >= BUILT ? "is-open" : ""} style={{ height: `${h}%`, ["--i" as string]: i }} />
      ))}
    </div>
  );
}
