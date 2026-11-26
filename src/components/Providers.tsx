"use client";

import { useEffect, type ReactNode } from "react";

/** Marks the document as hydrated, which turns off the CSS failsafes that reveal content if scripts never run. */
export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    // On a very slow link the CSS failsafe may already have revealed the text: keep it, do not replay the entrance.
    const line = document.querySelector(".hero2-line > span");
    if (line && getComputedStyle(line).transform === "none") root.classList.add("is-late");
    root.dataset.hydrated = "true";
  }, []);
  return <>{children}</>;
}
