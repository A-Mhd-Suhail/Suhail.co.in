"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { network } from "@/content/network";
import { publicProjects, type Project } from "@/content/projects";

const ProjectMap = dynamic(() => import("./ProjectMap"));

const statusLabel = { completed: "Completed", "in-progress": "In progress", prototype: "Prototype" } as const;

/** Progress at which each destination takes over: [in, out]. The intro is the first window. */
const WINDOWS = [
  { a: -0.06, b: 0.2 },
  { a: 0.25, b: 0.5 },
  { a: 0.55, b: 0.78 },
  { a: 0.83, b: 9 },
];

/**
 * "Things I build": a pinned stage whose scroll progress (--bp) draws the map, sends signals between three
 * destinations and brings each project in with its own preview. Markers and buttons are real links.
 */
export function Network() {
  const root = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);
  const [still, setStill] = useState(false);

  const all = publicProjects();
  const stops = network.stops
    .map((s, i) => ({ ...s, project: all.find((p) => p.slug === s.slug), a: WINDOWS[i + 1].a }))
    .filter((s): s is typeof s & { project: Project } => !!s.project);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      return;
    }
    let raf = 0;
    let last = -1;
    const update = () => {
      raf = 0;
      const total = Math.max(1, el.offsetHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total));
      el.style.setProperty("--bp", p.toFixed(4));
      const s = WINDOWS.slice(1).filter((w) => p >= w.a).length;
      if (s !== last) {
        last = s;
        setStage(s);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={root} id="things-i-build" className="beyond network" data-tone="dark" data-stage={stage} aria-labelledby="network-title">
      <div className="beyond-sticky">
        <div className="beyond-bg" aria-hidden />
        <div className="beyond-map">
          <ProjectMap stops={stops.map((s) => ({ slug: s.slug, name: s.project.name, node: s.node, a: s.a }))} />
        </div>
        <div className="beyond-scrim" aria-hidden />

        <p className="beyond-title" aria-hidden>
          Global network
        </p>

        <div className="beyond-copy">
          <div className="rv" style={{ "--a": WINDOWS[0].a, "--b": WINDOWS[0].b } as CSSProperties}>
            <p className="bp-label">Selected work</p>
            <h2 id="network-title" className="bp-name">
              {network.title}
            </h2>
            <p className="bp-text">{network.subtitle}</p>
          </div>

          {stops.map((s, i) => {
            const p = s.project;
            const active = still || stage === i + 1;
            return (
              <div key={s.slug} className="rv nw-panel" style={{ "--a": WINDOWS[i + 1].a, "--b": WINDOWS[i + 1].b } as CSSProperties} {...(active ? {} : { inert: true })}>
                <p className="bp-label">
                  <span className="nw-no">{String(i + 1).padStart(2, "0")}</span> {[p.category, p.context].filter(Boolean).join(" · ")}
                </p>
                <h3 className="bp-name nw-name">{p.name}</h3>
                <p className="nw-headline">{p.headline}</p>
                <p className="bp-text">{s.blurb}</p>
                {p.status && (
                  <p className="nw-status">
                    <i aria-hidden /> {statusLabel[p.status]}
                  </p>
                )}
                <div className="nw-actions">
                  <a className="nw-btn nw-btn-main" href={`/work/${p.slug}`}>
                    Explore project <span aria-hidden>→</span>
                  </a>
                  {p.links.demo && (
                    <a className="nw-btn" href={p.links.demo} target="_blank" rel="noopener noreferrer">
                      Live demo
                    </a>
                  )}
                  {p.links.repo && (
                    <a className="nw-btn" href={p.links.repo} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="nw-previews" aria-hidden>
          {stops.map((s, i) => {
            const shot = s.project.screenshots[0];
            if (!shot) return null;
            return (
              <div key={s.slug} className="rv nw-shot" style={{ "--a": WINDOWS[i + 1].a, "--b": WINDOWS[i + 1].b } as CSSProperties}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shot.src} alt="" width={shot.width} height={shot.height} loading="lazy" decoding="async" />
              </div>
            );
          })}
        </div>

        <span className="nw-orbit" aria-hidden />
        <div className="beyond-pager" aria-hidden>
          <i />
          <i />
          <i />
        </div>
      </div>
    </section>
  );
}
