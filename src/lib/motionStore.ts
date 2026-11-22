"use client";

import { useSyncExternalStore } from "react";

/** Shared "pause the 3D animation" state, used by the header control and the hero scene. */
let paused = false;
const listeners = new Set<() => void>();

export const motionStore = {
  get: () => paused,
  set(value: boolean) {
    paused = value;
    listeners.forEach((l) => l());
  },
  toggle() {
    motionStore.set(!paused);
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

export function usePaused() {
  return useSyncExternalStore(motionStore.subscribe, motionStore.get, () => false);
}
