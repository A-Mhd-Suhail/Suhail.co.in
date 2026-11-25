"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/** Adds `is-in` once the element scrolls into view. Without IntersectionObserver or with reduced motion it shows at once. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add("is-in");
        io.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** Headline whose lines rise out of a mask when scrolled into view. Pass one string per line. */
export function Headline({ lines, as = "h2", className }: { lines: string[]; as?: "h1" | "h2" | "h3"; className?: string }) {
  const ref = useReveal<HTMLHeadingElement>();
  const Tag = as as ElementType;
  // The heading itself is the trigger: a line pushed fully outside its own mask would never intersect.
  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span className="mask" key={line}>
          <span className="mask-inner" style={{ display: "block", "--hd": `${i * 0.1}s` } as CSSProperties}>
            {line}{" "}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** Quiet fade for supporting blocks. Use sparingly. */
export function Fade({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`fade-block ${className ?? ""}`} style={{ "--hd": `${delay}s` } as CSSProperties}>
      {children}
    </div>
  );
}
