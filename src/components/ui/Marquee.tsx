"use client";

import { motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useEffect, useRef } from "react";

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/**
 * A ticker that drifts on its own and speeds up (and reverses) with your scrolling.
 * Decorative: hidden from assistive tech; static for reduced motion.
 */
export function Marquee({ items }: { items: string[] }) {
  const reduced = useReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const inView = useInView(host);
  const visible = useRef(true);
  useEffect(() => {
    visible.current = inView;
  }, [inView]);
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const boost = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const dir = useRef(1);
  const x = useTransform(base, (v) => `${wrap(-25, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduced || !visible.current) return;
    const b = boost.get();
    if (b < -0.05) dir.current = -1;
    else if (b > 0.05) dir.current = 1;
    const move = dir.current * 1.6 * (delta / 1000);
    base.set(base.get() + move + dir.current * Math.abs(b) * move);
  });

  const group = (
    <div className="marquee-group">
      {items.map((t, i) => (
        <span key={t} className="marquee-item">
          <span className={i % 2 ? "is-outline" : ""}>{t}</span>
          <span className="marquee-dot" />
        </span>
      ))}
    </div>
  );

  return (
    <div ref={host} className="marquee" aria-hidden>
      <motion.div className="marquee-track" style={{ x }}>
        {group}
        {group}
        {group}
        {group}
      </motion.div>
    </div>
  );
}
