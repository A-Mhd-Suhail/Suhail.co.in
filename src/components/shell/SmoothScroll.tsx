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
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lenis: Lenis | undefined;
    if (!reduced) {
      lenis = new Lenis({ autoRaf: true, lerp: 0.085, wheelMultiplier: 0.95 });
      window.__lenis = lenis;
    }

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest("a");
      const href = a?.getAttribute("href");
      if (!href || href.length < 2 || !href.startsWith("#")) return;
      const id = href.slice(1);
      if (!document.getElementById(id)) return;
      e.preventDefault();
      // Let an open menu close (and unlock scrolling) before moving.
      window.setTimeout(() => scrollToHash(id), 90);
    };
    document.addEventListener("click", onClick);

    // Deep link on load, e.g. /#work
    const initial = window.location.hash.slice(1);
    if (initial) window.setTimeout(() => scrollToHash(initial), 1700);

    return () => {
      document.removeEventListener("click", onClick);
      lenis?.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}
