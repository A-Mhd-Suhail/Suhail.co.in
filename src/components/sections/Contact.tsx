import { Mail, MessageCircle, Phone } from "lucide-react";
import { CopyEmail } from "@/components/shell/CopyEmail";
import { Headline } from "@/components/ui/Reveal";
import { profile } from "@/content/profile";
import { visibleSocialLinks } from "@/content/social";

export function Contact() {
  const { email, phoneDisplay, phoneE164, whatsapp, country } = profile.contact;
  return (
    <section id="contact" className="section overlap overlap-light" data-tone="light" aria-labelledby="contact-title">
      <div className="wrap">
        <p className="label" style={{ marginBottom: "1rem" }}>Contact</p>
        <div id="contact-title">
          <Headline as="h2" className="h1" lines={["Have something interesting", "in mind? Let's talk."]} />
        </div>
        <p className="lede" style={{ margin: "1.25rem 0 2.5rem" }}>
          I&apos;m open to connecting with developers, founders, innovators and anyone who enjoys building meaningful technology.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem 1.5rem", marginBottom: "3.5rem" }}>
          <a className="contact-mail" href={`mailto:${email}`}>{email}</a>
          <CopyEmail email={email} />
        </div>

        <div className="contact-grid">
          <a className="contact-cell" href={`mailto:${email}`}>
            <Mail aria-hidden size={18} strokeWidth={1.5} />
            <span><small>Email</small><span>Write to me</span></span>
          </a>
          <a className="contact-cell" href={`tel:${phoneE164}`}>
            <Phone aria-hidden size={18} strokeWidth={1.5} />
            <span><small>Phone</small><span>{phoneDisplay}</span></span>
          </a>
          <a className="contact-cell" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
            <MessageCircle aria-hidden size={18} strokeWidth={1.5} />
            <span><small>WhatsApp</small><span>Message me</span></span>
          </a>
          <div className="contact-cell">
            <span style={{ width: 18, height: 18 }} aria-hidden />
            <span><small>Based in</small><span>{country}</span></span>
          </div>
        </div>

        {visibleSocialLinks.length > 0 && (
          <ul aria-label="Social profiles" style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", marginTop: "2.5rem" }}>
            {visibleSocialLinks.map((s) => (
              <li key={s.label}>
                <a className="text-link" href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
