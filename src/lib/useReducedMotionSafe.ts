"use client";

import { useEffect, useState } from "react";

/**
 * prefers-reduced-motion that is `false` on the server and on the first client render, then the real
 * value after mount. Use it for anything that changes rendered markup, so hydration always matches.
 */
export function useReducedMotionSafe() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}
