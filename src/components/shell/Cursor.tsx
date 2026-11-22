"use client";

import { useEffect, useRef } from "react";

/**
 * Custom cursor for mouse users only: an exact-tracking dot plus a smoothed ring.
 * The ring grows over links/buttons and shows a label over elements marked data-cursor="…".
 * Touch and coarse pointers keep the native cursor; keyboard focus styles are untouched.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let raf = 0;

    const loop = () => {
      rx += (x - rx) * (reduced ? 1 : 0.18);
      ry += (y - ry) * (reduced ? 1 : 0.18);
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (!root.classList.contains("cursor-on")) {
        rx = x;
        ry = y;
        root.classList.add("cursor-on");
      }
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null;
      const labelled = t?.closest<HTMLElement>("[data-cursor]");
      const interactive = t?.closest("a, button, [role='tab'], summary");
      root.classList.toggle("cursor-label", !!labelled);
      root.classList.toggle("cursor-link", !!interactive && !labelled);
      if (label.current) label.current.textContent = labelled?.dataset.cursor ?? "";
    };
    // Magnetic pull: buttons lean slightly towards the cursor.
    let magnet: HTMLElement | null = null;
    const pull = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || reduced) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>(".btn, .nav-btn, .nav-pill");
      if (magnet && magnet !== el) {
        magnet.style.transform = "";
        magnet = null;
      }
      if (!el) return;
      magnet = el;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.28;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.4;
      el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
    };
    const down = () => root.classList.add("cursor-down");
    const up = () => root.classList.remove("cursor-down");
    const leave = () => {
      root.classList.remove("cursor-on");
      if (magnet) {
        magnet.style.transform = "";
        magnet = null;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointermove", pull, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointermove", pull);
      if (magnet) magnet.style.transform = "";
      document.removeEventListener("mouseover", onOver);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
      root.classList.remove("cursor-on", "cursor-link", "cursor-label", "cursor-down");
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden>
        <span ref={label} />
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  );
}
