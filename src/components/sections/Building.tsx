"use client";

import { useEffect, useRef } from "react";
import { NightBerriezLogo } from "@/components/nightberriez/NightBerriezLogo";
import { profile } from "@/content/profile";
import { startup } from "@/content/startup";

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);

/**
 * NightBerrieZ: a small circle holding the monogram opens, on a short scroll, into the whole brand. The circle is a
 * clip-path on a dark layer, so the ivory page stays visible around it until it has filled the screen (no blank frames).
 * Scroll progress drives three numbers: --e (iris), --c (copy) and --s (starting logo scale).
 */
export function Building() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // stylesheet shows the finished state

    let raf = 0;
    let near = false;
    const logo = el.querySelector<HTMLElement>(".nbx-logo");

    const update = () => {
      raf = 0;
      const total = Math.max(1, el.offsetHeight - window.innerHeight);
      const top = el.getBoundingClientRect().top;
      // The circle starts to appear as the section's top edge nears the bottom of the screen.
      const lead = window.innerHeight * 0.3;
      const np = (-top + lead) / (total + lead);
      const e = ease(clamp((np - 0.03) / 0.58));
      const c = clamp((np - 0.66) / 0.24);
      el.style.setProperty("--e", e.toFixed(4));
      el.style.setProperty("--c", c.toFixed(4));
      el.style.setProperty("--k", clamp(np / 0.05).toFixed(3));
      const copy = String(c > 0.7);
      if (el.dataset.copy !== copy) el.dataset.copy = copy;
      const ready = String(c > 0.9);
      if (el.dataset.ready !== ready) el.dataset.ready = ready;
      if (logo) {
        // Scale at which the monogram (about 52% of the lockup width) fits a 64px circle.
        const s0 = Math.min(0.5, 64 / (0.52 * logo.offsetWidth));
        el.style.setProperty("--s", s0.toFixed(4));
      }
    };
    const onScroll = () => {
      if (near && !raf) raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        el.dataset.live = String(near);
        if (near) onScroll();
      },
      { rootMargin: "60% 0px 0px 0px" },
    );
    io.observe(el);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={root} id="building" className="nbx" data-live="false" aria-labelledby="building-title">
      <div className="nbx-sticky" data-tone="light">
        <span className="nbx-orbit" aria-hidden />
        <div className="nbx-iris" data-tone="dark">
          <div className="nbx-bg" aria-hidden />
          <div className="nbx-logo">
            <NightBerriezLogo />
          </div>
          <div className="nbx-copy">
            <p className="nbx-label">{startup.name}</p>
            <h2 id="building-title" className="nbx-title">
              {startup.status}
            </h2>
            <p className="nbx-text">{startup.intro}</p>
            <p className="nbx-text nbx-text-dim">{startup.invitation}</p>
            <a className="nbx-cta" href={`mailto:${profile.contact.email}?subject=NightBerrieZ`}>
              {startup.cta} <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
