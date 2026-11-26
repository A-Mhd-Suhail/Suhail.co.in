import Image from "next/image";
import { Fade } from "@/components/ui/Reveal";
import { network } from "@/content/network";
import { publicProjects, type Project } from "@/content/projects";
import "./projects.css";

const statusLabel = { completed: "Completed", "in-progress": "In progress", prototype: "Prototype" } as const;

/** The projects on a plain white page: screenshot in a window frame, alternating right, left, right; rises in on scroll. */
export function Projects() {
  const all = publicProjects();
  const items = network.stops
    .map((s) => ({ ...s, project: all.find((p) => p.slug === s.slug) }))
    .filter((s): s is typeof s & { project: Project } => !!s.project);

  return (
    <section id="things-i-build" className="pj overlap" data-tone="light" data-bar="#fff" data-own-reveal="" aria-labelledby="pj-title">
      <div className="pj-wrap">
        <Fade className="pj-head">
          <h2 id="pj-title" className="pj-title">
            {network.title}
          </h2>
          <p className="pj-sub">{network.subtitle}</p>
        </Fade>

        {items.map(({ slug, blurb, project: p }) => {
          const shot = p.screenshots[0];
          return (
            <article key={slug} className="pj-row">
              <Fade className="pj-text">
                <p className="pj-tag">{p.tag ?? p.category}</p>
                <h3 className="pj-name">{p.name}</h3>
                <p className="pj-headline">{p.headline}</p>
                <p className="pj-blurb">{blurb}</p>
                {p.status && <p className="pj-status">{statusLabel[p.status]}</p>}
                <div className="pj-actions">
                  <a className="pj-btn pj-btn-main" href={`/work/${slug}`}>
                    Explore project
                  </a>
                  {p.links.demo && (
                    <a className="pj-btn" href={p.links.demo} target="_blank" rel="noopener noreferrer">
                      Live demo
                    </a>
                  )}
                  {p.links.repo && (
                    <a className="pj-btn" href={p.links.repo} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  )}
                </div>
              </Fade>
              {shot && (
                <Fade className="pj-media" delay={0.12}>
                  <a className="pj-shot" href={`/work/${slug}`} tabIndex={-1} aria-hidden>
                    <span className="pj-bar">
                      <i />
                      <i />
                      <i />
                    </span>
                    <Image src={shot.src} alt="" width={shot.width} height={shot.height} sizes="(max-width: 860px) 92vw, 56vw" quality={75} />
                  </a>
                </Fade>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
