"use client";

import { MotionConfig } from "motion/react";
import { useEffect, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
