"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

type GLState = "checking" | "ok" | "unavailable";

function detectWebGL(): boolean {
  if (new URLSearchParams(window.location.search).get("webgl") === "off") return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Shared lifecycle for hero 3D scenes:
 * - WebGL detection (+ ?webgl=off for testing the fallback)
 * - pause rendering when off-screen or tab hidden
 * - context-loss -> fallback
 * - smoothed pointer in [-1, 1] (mouse only), scroll progress of the host element
 */
export function useScene(host: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();
  const [gl, setGl] = useState<GLState>("checking");
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setGl(detectWebGL() ? "ok" : "unavailable");
  }, []);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    const onVis = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [host]);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  // If WebGL exists but the scene never reports ready (its chunk failed to load), use the fallback.
  useEffect(() => {
    if (gl !== "ok" || ready) return;
    const t = window.setTimeout(() => setGl("unavailable"), 8000);
    return () => window.clearTimeout(t);
  }, [gl, ready]);

  const onReady = useCallback(() => setReady(true), []);
  const onLost = useCallback(() => setGl("unavailable"), []);

  return { reduced, gl, active: inView && pageVisible, ready, pointer, onReady, onLost };
}
