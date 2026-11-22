"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Project, ProjectStatus } from "@/content/projects";

const statusLabel: Record<ProjectStatus, string> = { completed: "Completed", "in-progress": "In progress", prototype: "Prototype" };

/** In-page project detail: a native modal dialog (focus trap, Escape and inert background for free). */
export function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (project && !d.open) {
      d.showModal();
      document.body.style.overflow = "hidden";
      window.__lenis?.stop();
    } else if (!project && d.open) {
      d.close();
    }
    return () => {
      document.body.style.overflow = "";
      window.__lenis?.start();
    };
  }, [project]);

  const p = project;
  const facts: [string, string | number | undefined][] = p
    ? [["Status", p.status && statusLabel[p.status]], ["Category", p.category], ["Context", p.context], ["Year", p.year]]
    : [];
  const chapters: [string, string | undefined][] = p
    ? [["Overview", p.overview], ["The problem", p.problem], ["Approach", p.approach], ["My contribution", p.contribution]]
    : [];

  return (
    <dialog
      ref={ref}
      className="dialog"
      data-lenis-prevent
      aria-labelledby="dialog-title"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {p && (
        <div className="dialog-inner">
          <button type="button" className="dialog-close" onClick={onClose}>
            Close
          </button>
          <p className="label">{[p.category, p.context].filter(Boolean).join(" · ")}</p>
          <h2 className="h1" id="dialog-title" style={{ marginTop: "0.75rem" }}>
            {p.name}
          </h2>
          <p className="lede" style={{ marginTop: "1rem" }}>
            {p.summary}
          </p>
          {p.visibility === "draft" && (
            <p style={{ marginTop: "1rem" }}>
              <span className="draft-badge">Draft · hidden in production</span>
            </p>
          )}
          {facts.some(([, v]) => v) && (
            <dl className="project-facts">
              {facts.map(([k, v]) => (v ? <div key={k}><dt>{k}</dt><dd>{v}</dd></div> : null))}
            </dl>
          )}
          {(p.links.demo || p.links.repo) && (
            <p style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.5rem" }}>
              {p.links.demo && <a className="btn btn-solid" href={p.links.demo} target="_blank" rel="noreferrer">Live project</a>}
              {p.links.repo && <a className="btn" href={p.links.repo} target="_blank" rel="noreferrer">Repository</a>}
            </p>
          )}
          {p.screenshots.length > 0 && (
            <div className="shots" style={{ marginTop: "2rem" }}>
              {p.screenshots.map((s) => (
                <figure key={s.src} style={{ margin: 0 }}>
                  <Image src={s.src} alt={s.alt} width={s.width} height={s.height} sizes="(min-width: 800px) 50vw, 100vw" />
                  {s.caption && <figcaption>{s.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}
          {chapters.map(([title, text]) =>
            text ? (
              <section className="chapter" key={title}>
                <h3 className="chapter-label">{title}</h3>
                <p className="prose">{text}</p>
              </section>
            ) : null,
          )}
          {p.features.length > 0 && (
            <section className="chapter">
              <h3 className="chapter-label">What it does</h3>
              <ul className="bullets">{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
            </section>
          )}
          {p.tech.length > 0 && (
            <section className="chapter">
              <h3 className="chapter-label">Technologies</h3>
              <ul className="tags">{p.tech.map((t) => <li key={t} className="tag">{t}</li>)}</ul>
            </section>
          )}
          {p.visibility === "draft" && (
            <section className="chapter">
              <h3 className="chapter-label">Draft notes</h3>
              <div>
                <p className="note" style={{ marginTop: 0 }}>
                  Only visible while developing. Fill in overview, features, technologies, links and screenshots in
                  src/content/projects.ts, then set visibility to &quot;public&quot;.
                </p>
                {p.planned && p.planned.length > 0 && (
                  <ul className="bullets" style={{ marginTop: "1rem" }}>
                    {p.planned.map((f) => <li key={f}>{f} (planned, not confirmed)</li>)}
                  </ul>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </dialog>
  );
}
