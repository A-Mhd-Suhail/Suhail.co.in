"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

function Word({ children, progress, range, reduced }: { children: string; progress: MotionValue<number>; range: [number, number]; reduced: boolean }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return <motion.span style={{ opacity: reduced ? 1 : opacity }}>{children} </motion.span>;
}

/** A statement that fills in word by word as you scroll through it. */
export function ScrollText({ text, className, as = "h2" }: { text: string; className?: string; as?: "h2" | "p" }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.5"] });
  const words = text.split(" ");
  const Tag = motion[as] as typeof motion.h2;
  return (
    <Tag ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} reduced={reduced}>
          {w}
        </Word>
      ))}
    </Tag>
  );
}
