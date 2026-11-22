import Image from "next/image";
import { visibleAchievements, type Achievement } from "@/content/achievements";

function resultLabel(a: Achievement) {
  return a.result.kind === "participant" ? (a.result.label ?? "Participant") : a.result.label;
}

/** Verified entries, or honest empty slots. Nothing is invented. */
export function Timeline({ limit }: { limit?: number }) {
  const items = visibleAchievements().slice(0, limit);

  if (items.length === 0) {
    return (
      <>
        <ol className="timeline" aria-label="Hackathon timeline">
          {[0, 1, 2].map((i) => (
            <li key={i} className="slot">
              <span>Year</span>
              <span>
                <span className="slot-title">Competition name</span>
                <span>Organizer · Result · Project built</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="note">Entries appear here once they are verified. Nothing is invented.</p>
      </>
    );
  }

  return (
    <ol className="timeline" aria-label="Hackathon timeline">
      {items.map((a) => (
        <li key={`${a.event}-${a.year}-${resultLabel(a)}`} className={`entry ${a.result.kind === "winner" ? "is-win" : ""}`} data-reveal>
          <span className="label">{a.year}</span>
          <div>
            <p className="entry-result">{resultLabel(a)}</p>
            <h3 className="entry-title">{a.event}</h3>
            <p className="entry-meta">
              {[a.organizer, a.project && `Built: ${a.project}`].filter(Boolean).join(" · ")}
            </p>
            {a.certificate && (
              <Image
                src={a.certificate.src}
                alt={a.certificate.alt}
                width={a.certificate.width}
                height={a.certificate.height}
                sizes="(min-width: 800px) 320px, 80vw"
                style={{ marginTop: "1rem", width: "min(320px, 100%)", height: "auto", borderRadius: 6, border: "1px solid var(--rule)" }}
              />
            )}
            {a.proofUrl && (
              <p style={{ marginTop: "0.75rem" }}>
                <a className="text-link" href={a.proofUrl} target="_blank" rel="noreferrer">
                  View proof
                </a>
              </p>
            )}
            {a.visibility === "draft" && <span className="draft-badge">Draft · hidden in production</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}
