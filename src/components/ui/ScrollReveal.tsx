"use client";

import { useEffect } from "react";

/**
 * Reveals every `[data-reveal]` element as it enters the viewport (fade + rise, Lusion-style easing).
 * Watches for elements added later (filters, dialogs), so nothing stays hidden. Reduced-motion
 * users and a stalled script both end with everything visible.
 */
export function ScrollReveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-revealed"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-revealed");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    const watch = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)").forEach((el) => io.observe(el));
    };
    // Every block of every section below the hero animates in too, including ones not marked by hand.
    const mark = () => {
      document.querySelectorAll<HTMLElement>("main > section:not(#home), footer").forEach((sec) => {
        const body = sec.querySelector<HTMLElement>(":scope > .wrap") ?? sec;
        Array.from(body.children).forEach((child, i) => {
          const el = child as HTMLElement;
          if (el.hasAttribute("data-reveal") || el.querySelector("canvas") || el.classList.contains("preloader")) return;
          el.setAttribute("data-reveal", "");
          el.style.setProperty("--rd", `${Math.min(i, 6) * 0.08}s`);
        });
      });
    };
    mark();
    watch(document);
    const mo = new MutationObserver(() => {
      mark();
      watch(document);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    // Safety net: never leave content hidden if the observer does not fire.
    const failsafe = window.setTimeout(() => document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-revealed")), 6000);
    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);
  return null;
}
