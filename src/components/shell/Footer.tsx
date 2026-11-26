import { profile } from "@/content/profile";
import { navItems } from "@/content/nav";
import { visibleSocialLinks } from "@/content/social";
import { Year } from "./Year";

export function Footer() {
  const { email, phoneDisplay, phoneE164, country } = profile.contact;
  return (
    <footer className="footer overlap" data-tone="dark" data-bar="var(--ink)">
      <div className="wrap">
        <div className="footer-top" data-reveal>
          <div>
            <p className="footer-name">{profile.name}</p>
            <p className="footer-tag">{profile.headline}</p>
          </div>
          <nav aria-label="Footer" className="footer-nav">
            {navItems.map((n) => (
              <a key={n.id} href={n.href} className="text-link">
                {n.label}
              </a>
            ))}
            <a href="/" className="text-link">
              Back to top
            </a>
          </nav>
        </div>
        <div className="footer-bottom" data-reveal style={{ ["--rd" as string]: "0.15s" }}>
          <div className="footer-contact">
            <a className="text-link" href={`mailto:${email}`}>
              {email}
            </a>
            <a className="text-link" href={`tel:${phoneE164}`}>
              {phoneDisplay}
            </a>
            <span style={{ padding: "0.4rem 0" }}>{country}</span>
            {visibleSocialLinks.map((s) => (
              <a key={s.label} className="text-link" href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            ))}
          </div>
          <p>
            © <Year /> {profile.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
