"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Project } from "@/content/projects";

/** Large project image that opens the project panel. The picture drifts against the pointer. */
export function ProjectFrame({ project, onOpen }: { project: Project; onOpen: (p: Project) => void }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);
  const shot = project.screenshots[0];
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(useTransform(x, [-0.5, 0.5], [14, -14]), { stiffness: 120, damping: 20 });
  const sy = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 120, damping: 20 });

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (reduced || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <button
      type="button"
      ref={ref}
      className={`work-media ${shot ? "" : "is-empty"} ${inView ? "is-in" : ""}`}
      data-cursor="View"
      aria-label={`Open ${project.name}`}
      onClick={() => onOpen(project)}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {shot ? (
        <motion.div style={{ x: sx, y: sy, scale: 1.06, height: "100%" }}>
          <Image src={shot.src} alt="" width={shot.width} height={shot.height} sizes="(min-width: 900px) 66vw, 100vw" />
        </motion.div>
      ) : (
        "Screenshots will be added"
      )}
    </button>
  );
}
