"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.2, 0.7, 0.1, 1] as const;

/** Headline whose lines rise out of a mask when scrolled into view. Pass one string per line. */
export function Headline({
  lines,
  as = "h2",
  className,
}: {
  lines: string[];
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const Tag = motion[as];
  // The heading itself is the scroll trigger. Observing the moving line would never fire once it is
  // pushed fully outside its own clipping mask (which happens whenever a line wraps on a phone).
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
    >
      {lines.map((line, i) => (
        <span className="mask" key={line}>
          <motion.span
            className="mask-inner"
            style={{ display: "block" }}
            variants={{
              hidden: { y: "108%" },
              visible: { y: "0%", transition: { duration: 0.95, delay: i * 0.1, ease: EASE } },
            }}
          >
            {line}{" "}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Quiet fade for supporting blocks. Use sparingly. */
export function Fade({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={`fade-block ${className ?? ""}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
