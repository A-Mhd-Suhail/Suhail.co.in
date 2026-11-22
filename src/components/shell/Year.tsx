"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Current year in the visitor's browser, so a static build never goes stale. */
export function Year() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => new Date().getFullYear(),
  );
  return <span suppressHydrationWarning>{year}</span>;
}
