import { Timeline } from "@/components/recognition/Timeline";
import { Fade, Headline } from "@/components/ui/Reveal";
import { visibleAchievements } from "@/content/achievements";

const qualities = [
  { title: "Problem-solving under pressure", text: "A fixed deadline and a problem that has to work by the end of it." },
  { title: "Teamwork", text: "Splitting the work, deciding fast and building alongside other people." },
  { title: "Experimentation", text: "Trying new tools and ideas when there is no time to play it safe." },
];

export function Recognition() {
  const certs = visibleAchievements().filter((a) => a.certificate);
  return (
    <section id="achievements" className="section rule-top" data-tone="light" aria-labelledby="rec-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="label" style={{ marginBottom: "1rem" }}>Achievements</p>
            <Headline as="h2" className="h2" lines={["Ideas tested.", "Challenges taken on."]} />
          </div>
          <p className="lede" id="rec-title">
            I&apos;ve taken part in multiple hackathons and won some of them. Each one is a short window to take an idea
            from nothing to something that works.
          </p>
        </div>
        <ul className="qualities" style={{ marginBottom: "clamp(3rem, 7vw, 5.5rem)" }}>
          {qualities.map((q, i) => (
            <li key={q.title}>
              <Fade delay={i * 0.08}>
                <h3 className="h3" data-reveal>{q.title}</h3>
                <p>{q.text}</p>
              </Fade>
            </li>
          ))}
        </ul>
        <div className="split">
          <p className="h3 sticky-col">Timeline</p>
          <Timeline />
        </div>
        {certs.length > 0 && (
          <div style={{ marginTop: "clamp(3rem, 7vw, 5.5rem)" }}>
            <h3 className="h3" data-reveal style={{ marginBottom: "1.25rem" }}>Certificates</h3>
            <div className="cert-grid">
              {certs.map((a) => (
                <img key={a.event + a.year} src={a.certificate!.src} alt={a.certificate!.alt} width={a.certificate!.width} height={a.certificate!.height} loading="lazy" />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
