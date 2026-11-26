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
    const iris = el.querySelector<HTMLElement>(".nbx-iris")!;
    // The header follows the circle. Its lettering turns light once the circle reaches the name; the black strip
    // appears only once the circle covers the whole screen, so no band is ever painted across the white page.
    let state = "";
    const cover = (onName: boolean, full: boolean) => {
      const next = `${onName}${full}`;
      if (next === state) return;
      state = next;
      el.dataset.full = String(full);
      iris.dataset.tone = onName ? "dark" : "light";
      if (full) iris.dataset.bar = "#000";
      else delete iris.dataset.bar;
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cover(true, true); // stylesheet shows the finished state
      return;
    }

    let raf = 0;
    let near = false;
    const logo = el.querySelector<HTMLElement>(".nbx-logo");

    const update = () => {
      raf = 0;
      // All layout reads happen before the style writes below. The sticky screen's height stays put on phones.
      const vh = (el.firstElementChild as HTMLElement).offsetHeight;
      const total = Math.max(1, el.offsetHeight - vh);
      const top = el.getBoundingClientRect().top;
      const logoWidth = logo?.offsetWidth ?? 0;
      const name = document.querySelector(".header-logo")?.getBoundingClientRect();
      // The circle starts to appear as the section's top edge nears the bottom of the screen.
      const lead = vh * (window.innerWidth < vh ? 0.5 : 0.3); // sooner on phones: less blank white before the circle
      const np = (-top + lead) / (total + lead);
      const e = ease(clamp((np - 0.03) / 0.58));
      const c = clamp((np - 0.66) / 0.24);
      el.style.setProperty("--e", e.toFixed(4));
      el.style.setProperty("--c", c.toFixed(4));
      const k = clamp(np / 0.05);
      el.style.setProperty("--k", k.toFixed(3));
      // Same radius as the clip-path in the stylesheet: 34px, then 62vmax.
      const radius = k * 34 + e * 0.62 * Math.max(window.innerWidth, vh);
      const cx = window.innerWidth / 2;
      const cy = vh / 2;
      const toName = name ? Math.hypot(cx - (name.left + name.width / 2), cy - (name.top + name.height / 2)) : Infinity;
      cover(radius >= toName, radius >= Math.hypot(cx, cy));
      const copy = String(c > 0.7);
      if (el.dataset.copy !== copy) el.dataset.copy = copy;
      const ready = String(c > 0.9);
      if (el.dataset.ready !== ready) el.dataset.ready = ready;
      // The ring has left the screen past this point, so stop animating it.
      const orbit = String(e < 0.715);
      if (el.dataset.orbit !== orbit) el.dataset.orbit = orbit;
      // Scale at which the monogram (about 52% of the lockup width) fits a 64px circle.
      if (logoWidth) el.style.setProperty("--s", Math.min(0.5, 64 / (0.52 * logoWidth)).toFixed(4));
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
        <div className="nbx-iris" data-tone="light">
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
              {startup.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
