import type { ReactNode } from "react";

/** Label that rolls up and is replaced by a copy on hover or focus (CSS only). */
export function Roll({ children }: { children: string }) {
  return (
    <span className="roll">
      <span className="roll-in">
        <span>{children}</span>
        <span aria-hidden>{children}</span>
      </span>
    </span>
  );
}

export type { ReactNode };
