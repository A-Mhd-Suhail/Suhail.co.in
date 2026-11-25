"use client";

import Lenis from "lenis";
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
  else el.scrollIntoView();
  history.replaceState(null, "", `#${id}`);
  // Move keyboard focus with the view, as a native anchor jump would.
  if (!el.hasAttribute("tabindex")) {
    el.setAttribute("tabindex", "-1");
    el.addEventListener("blur", () => el.removeAttribute("tabindex"), { once: true });
  }
  el.focus({ preventScroll: true });
}

/**
 * Inertial scrolling for wheel/trackpad (touch stays native; reduced-motion users get plain
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
    if (!reduced) {
      lenis = new Lenis({ autoRaf: true, lerp: 0.085, wheelMultiplier: 0.95 });
      if (isReload) lenis.scrollTo(0, { immediate: true });
      window.__lenis = lenis;
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
      document.removeEventListener("click", onClick);
      lenis?.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}
