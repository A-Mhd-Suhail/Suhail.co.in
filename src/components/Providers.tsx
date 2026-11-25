"use client";

import { useEffect, type ReactNode } from "react";

/** Marks the document as hydrated, which turns off the CSS failsafes that reveal content if scripts never run. */
export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);
  return <>{children}</>;
}
