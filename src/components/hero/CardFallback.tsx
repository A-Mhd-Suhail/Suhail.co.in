import { profile } from "@/content/profile";

/** Static card for browsers without WebGL, or if the 3D scene does not start. Same text as the 3D card. */
export function CardFallback() {
  const c = profile.card;
  return (
    <div className="card-fallback" aria-hidden>
      <div className="card-fallback-face">
        <div className="cf-row">
          <span className="cf-brand">{c.brand}</span>
          <span>{c.established}</span>
        </div>
        <p className="cf-name">{c.name}</p>
        <p className="cf-role">{c.role}</p>
        <hr />
        <p className="cf-school">{c.school}</p>
        <div className="cf-row cf-foot">
          <span className="cf-course">{c.course}</span>
          <span>{profile.contact.country}</span>
        </div>
      </div>
    </div>
  );
}
