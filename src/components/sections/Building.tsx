import Image from "next/image";
import { Fade, Headline } from "@/components/ui/Reveal";
import { profile } from "@/content/profile";
import { startup } from "@/content/startup";

export function Building() {
  return (
    <section id="building" className="section dark overlap nb-brand" data-tone="dark" aria-labelledby="building-title">
      <div className="wrap">
        <p className="label" style={{ marginBottom: "1rem" }}>{startup.status}</p>
        <div id="building-title">
          <Headline as="h2" className="h1" lines={[startup.statement]} />
        </div>
        <p className="lede" style={{ marginTop: "1rem" }}>Something is taking shape.</p>
        {startup.logo && (
          <Image src={startup.logo} alt="NightBerrieZ logo" width={2000} height={2000} sizes="100vw" style={{ width: "min(1000px, 100%)", height: "auto", display: "block", margin: "clamp(2rem, 5vw, 4rem) auto" }} />
        )}

        <div className="split">
          <h3 className="h3 sticky-col" data-reveal>Why</h3>
          <Fade>
            <p className="prose" style={{ fontSize: "1.1875rem" }}>{startup.belief}</p>
            <p className="prose" style={{ marginTop: "1rem" }}>{startup.invitation}</p>
          </Fade>
        </div>

        <div style={{ marginTop: "clamp(3rem, 6vw, 5rem)" }}>
          <h3 className="h3" data-reveal style={{ marginBottom: "1.5rem" }}>Ways to join in</h3>
          <ul className="ways">
            {startup.ways.map((w) => (
              <li key={w.title}>
                <h4 className="h3">{w.title}</h4>
                <p>{w.text}</p>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: "2.5rem" }}>
            <a className="btn btn-light" href={`mailto:${profile.contact.email}?subject=NightBerrieZ`}>
              Say hello about NightBerrieZ
            </a>
          </p>
          <p className="note" style={{ color: "#a9a8a0" }}>
            This is an invitation to talk, not a job listing or a company announcement.
          </p>
        </div>
      </div>
    </section>
  );
}
