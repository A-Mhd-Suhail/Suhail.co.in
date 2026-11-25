"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/content/projects";
import { ProjectDialog } from "./ProjectDialog";
import { ProjectFrame } from "./ProjectFrame";
import { LetterRoll } from "../ui/LetterRoll";

const statusLabel = { completed: "Completed", "in-progress": "In progress", prototype: "Prototype" } as const;

export function WorkList({ projects }: { projects: Project[] }) {
  const categories = useMemo(() => Array.from(new Set(projects.map((p) => p.category).filter((c): c is string => !!c))), [projects]);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState<Project | null>(null);
  const shown = active ? projects.filter((p) => p.category === active) : projects;

  return (
    <>
      {categories.length > 1 && (
        <div className="filters" role="group" aria-label="Filter projects by category">
          <button className="chip" aria-pressed={active === null} onClick={() => setActive(null)}>
            All
          </button>
          {categories.map((c) => (
            <button key={c} className="chip" aria-pressed={active === c} onClick={() => setActive(c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="work-list">
        {shown.map((p) => (
          <article className="work-item" key={p.slug} data-reveal>
            <ProjectFrame project={p} onOpen={setOpen} />
            <div className="work-text">
              <h3 className="h3 work-name">
                <LetterRoll text={p.name} />
              </h3>
              <p className="work-meta">
                {[p.category, p.context, p.status && statusLabel[p.status], p.year].filter(Boolean).map((m) => (
                  <span key={String(m)}>{m}</span>
                ))}
              </p>
              <p className="prose">{p.summary}</p>
              {p.visibility === "draft" && (
                <p style={{ marginTop: "0.75rem" }}>
                  <span className="draft-badge">Draft · hidden in production</span>
                </p>
              )}
              <p style={{ marginTop: "1rem" }}>
                <button type="button" className="text-link as-button" onClick={() => setOpen(p)}>
                  View project
                </button>
                <a className="text-link" href={`/work/${p.slug}`} style={{ marginLeft: "1.5rem" }}>
                  Case study
                </a>
              </p>
            </div>
          </article>
        ))}
      </div>
      <ProjectDialog project={open} onClose={() => setOpen(null)} />
    </>
  );
}
