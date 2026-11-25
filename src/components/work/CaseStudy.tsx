import Image from "next/image";
import type { Project } from "@/content/projects";
import "../../app/work/[slug]/case-study.css";

const statusLabel = { completed: "Completed", "in-progress": "In progress", prototype: "Prototype" } as const;

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="cs-section">
      <h2 className="cs-label">{label}</h2>
      <div className="cs-body">{children}</div>
    </section>
  );
}

export function CaseStudy({ project: p, next }: { project: Project; next?: Project }) {
  const hero = p.screenshots[0];
  const meta = [p.category, p.context].filter(Boolean).join(" · ");

  return (
    <main className="cs-page" data-tone="dark">
      <div className="cs-wrap">
        <a className="cs-back" href="/work">
          <span aria-hidden="true">←</span> All projects
        </a>

        <header className="cs-header cs-rise">
          {meta && <p className="cs-eyebrow">{meta}</p>}
          <h1 className="cs-title">{p.name}</h1>
          {p.headline && <p className="cs-headline">{p.headline}</p>}
        </header>

        {hero && (
          <div className="cs-hero cs-rise cs-rise-2">
            <Image src={hero.src} alt={hero.alt} width={hero.width} height={hero.height} sizes="(min-width: 1200px) 72rem, 100vw" priority />
          </div>
        )}

        {(p.links.demo || p.links.repo) && (
          <div className="cs-actions cs-rise cs-rise-3">
            {p.links.demo && (
              <a className="cs-action" href={p.links.demo} target="_blank" rel="noopener noreferrer">
                Live demo <span aria-hidden="true">↗</span>
              </a>
            )}
            {p.links.repo && (
              <a className="cs-action" href={p.links.repo} target="_blank" rel="noopener noreferrer">
                GitHub repository <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        )}

        {p.overview && (
          <Section label="Overview">
            <p>{p.overview}</p>
          </Section>
        )}
        {p.problem && (
          <Section label="The problem">
            <p>{p.problem}</p>
          </Section>
        )}
        {p.approach && (
          <Section label="The approach">
            <p>{p.approach}</p>
          </Section>
        )}
        {p.features.length > 0 && (
          <Section label="What it does">
            <ul className="cs-list">
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </Section>
        )}
        {p.tech.length > 0 && (
          <Section label="Technologies">
            <ul className="cs-tags">
              {p.tech.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </Section>
        )}
        {p.contribution && (
          <Section label="My contribution">
            <p>{p.contribution}</p>
          </Section>
        )}
        {(p.status || p.statusNote) && (
          <Section label="Development status">
            {p.status && (
              <p className="cs-status">
                <span className="cs-dot" aria-hidden="true" />
                {statusLabel[p.status]}
              </p>
            )}
            {p.statusNote && <p>{p.statusNote}</p>}
          </Section>
        )}
        {p.screenshots.length > 0 && (
          <Section label="Screenshots">
            <div className="cs-gallery">
              {p.screenshots.map((s) => (
                <figure key={s.src} className="cs-figure">
                  <Image src={s.src} alt={s.alt} width={s.width} height={s.height} sizes="(min-width: 900px) 48rem, 100vw" />
                  {s.caption && <figcaption>{s.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </Section>
        )}

        <footer className="cs-footer">
          <a className="cs-back" href="/work">
            <span aria-hidden="true">←</span> Back to all projects
          </a>
          {next && (
            <a className="cs-next" href={`/work/${next.slug}`}>
              <span className="cs-label">Next project</span>
              <span className="cs-next-name">
                {next.name} <span aria-hidden="true">→</span>
              </span>
            </a>
          )}
        </footer>
      </div>
    </main>
  );
}
