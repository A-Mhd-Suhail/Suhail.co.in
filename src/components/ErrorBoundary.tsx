"use client";

import { Component, type ReactNode } from "react";

/**
 * Keeps a failing decorative part (a 3D scene, a lazy chunk) from taking the page down with it.
 * The page content never depends on what this wraps.
 */
export class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode; onError?: (e: unknown) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    this.props.onError?.(error);
  }
  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
