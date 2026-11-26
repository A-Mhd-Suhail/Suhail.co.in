"use client";

import { useEffect, useRef } from "react";

/** A slim vertical track at the right edge whose thumb follows page scroll. Decorative. */
export function ScrollIndicator() {
  const thumb = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      if (window.matchMedia("(max-width: 700px)").matches) return; // the track is hidden on phones
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      if (thumb.current) thumb.current.style.setProperty("--p", p.toFixed(4));
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
    <div className="scroll-ind" aria-hidden>
      <span ref={thumb} className="scroll-ind-thumb" />
    </div>
  );
}
