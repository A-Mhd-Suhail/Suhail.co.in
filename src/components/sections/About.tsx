import { aboutContent as a } from "@/content/about";
import { profile } from "@/content/profile";
import { Fade } from "@/components/ui/Reveal";
import { Parallax } from "@/components/ui/Parallax";
import { ScrollText } from "@/components/ui/ScrollText";

export function About() {
  return (
    <section id="about" className="section" data-tone="light" aria-labelledby="about-title">
      <div className="wrap">
        <p className="label" id="about-title" style={{ marginBottom: "1.5rem" }}>
          About
        </p>
        <div className="split" style={{ paddingBottom: "clamp(2.5rem, 5vw, 4rem)" }}>
          <div>
            <ScrollText as="h2" className="intro-statement" text={a.opening} />
            <Parallax from={40} to={-40} className="pane-stack">
              <i />
              <i />
              <i />
              <i />
            </Parallax>
          </div>
          <Fade className="prose" delay={0.1}>
            {a.background.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </Fade>
        </div>

        <div className="chapter">
          <h3 className="chapter-label" data-reveal>Education</h3>
          <div>
            <p className="h3">{profile.education.degree}</p>
            <p className="muted" style={{ marginTop: "0.4rem" }}>
              {profile.education.status}
            </p>
          </div>
        </div>

        <div className="chapter">
          <h3 className="chapter-label" data-reveal>Technical interests</h3>
          <ul className="card-list" style={{ borderTop: 0 }}>
            {a.interests.map((i) => (
              <li key={i.title}>
                <strong>{i.title}</strong>
                <p>{i.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="chapter">
          <h3 className="chapter-label" data-reveal>What I like building</h3>
          <ul className="bullets">
            {a.building.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>

        <div className="chapter">
          <h3 className="chapter-label" data-reveal>How I experiment</h3>
          <ol className="steps">
            {a.approach.map((s) => (
              <li key={s.step}>
                <div>
                  <strong>{s.step}</strong>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="chapter">
          <h3 className="chapter-label" data-reveal>My journey so far</h3>
          <ol className="card-list" style={{ borderTop: 0 }}>
            {a.journey.map((j) => (
              <li key={j.title}>
                <strong>
                  {j.title} <span className="label" style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem" }}>{j.label}</span>
                </strong>
                <p>{j.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

