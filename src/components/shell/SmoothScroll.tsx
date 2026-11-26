"use client";

import type Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

declare global {
  interface Window {
    __lenis?: Lenis;
    /** performance.now() until which the nav must stay visible (set while an anchor scroll runs). */
    __navLock?: number;
  }
}

function scrollToHash(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.__navLock = performance.now() + 2200;
  if (window.__lenis) window.__lenis.scrollTo(el, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  history.replaceState(null, "", `#${id}`);
  // Move keyboard focus with the view, as a native anchor jump would.
  if (!el.hasAttribute("tabindex")) {
    el.setAttribute("tabindex", "-1");
    el.addEventListener("blur", () => el.removeAttribute("tabindex"), { once: true });
  }
  el.focus({ preventScroll: true });
}

/**
 * Inertial scrolling for wheel/trackpad (touch devices and reduced-motion users get plain native
 * scrolling), plus smooth in-page anchor links for every `#section` link on the page.
 */
export function SmoothScroll() {
  useEffect(() => {
    // A refresh always starts at the top of the landing page: no restored scroll position, no #hash.
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const isReload = nav?.type === "reload";
    if (isReload) {
      history.scrollRestoration = "manual";
      if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
      window.scrollTo(0, 0);
      requestAnimationFrame(() => window.scrollTo(0, 0));
    } else {
      history.scrollRestoration = "auto";
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lenis: Lenis | undefined;
    let cancelled = false;
    let idle = 0;
    // Lenis (inertial wheel scrolling) is a nicety: load it when the browser is idle, never before first paint.
    const startLenis = () => {
      import("lenis")
        .then(({ default: LenisCtor }) => {
          if (cancelled) return;
          lenis = new LenisCtor({ autoRaf: true, lerp: 0.11, wheelMultiplier: 1 });
          if (isReload) lenis.scrollTo(0, { immediate: true });
          window.__lenis = lenis;
        })
        .catch(() => undefined);
    };
    // Mouse and trackpad only. Touch scrolling is already smooth natively, and Lenis's touch listeners could delay it.
    if (!reduced && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(startLenis, { timeout: 2000 });
      else idle = window.setTimeout(startLenis, 400);
    }

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest("a");
      let href = a?.getAttribute("href");
      // "/#section" on the home page behaves like "#section".
      if (href?.startsWith("/#") && window.location.pathname === "/") href = href.slice(1);
      if (!href || href.length < 2 || !href.startsWith("#")) return;
      const id = href.slice(1);
      if (!document.getElementById(id)) return;
      e.preventDefault();
      // Let an open menu close (and unlock scrolling) before moving.
      window.setTimeout(() => scrollToHash(id), 90);
    };
    document.addEventListener("click", onClick);

    // Deep link on load, e.g. /#work
    const initial = isReload ? "" : window.location.hash.slice(1);
    if (initial) window.setTimeout(() => scrollToHash(initial), 1700);

    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      document.removeEventListener("click", onClick);
      lenis?.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}
