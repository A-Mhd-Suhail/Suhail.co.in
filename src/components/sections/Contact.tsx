import { Mail, Phone } from "lucide-react";
import { CopyEmail } from "@/components/shell/CopyEmail";
import { GithubIcon, LinkedinIcon, WhatsappIcon } from "@/components/shell/BrandIcons";
import { Headline } from "@/components/ui/Reveal";
import { profile } from "@/content/profile";
import { visibleSocialLinks } from "@/content/social";

export function Contact() {
  const { email, phoneDisplay, phoneE164, whatsapp } = profile.contact;
  const social = (label: string) => visibleSocialLinks.find((s) => s.label === label)?.url;
  const linkedin = social("LinkedIn");
  const github = social("GitHub");

  const links = [
    linkedin && { key: "linkedin", label: "LinkedIn", href: linkedin, icon: <LinkedinIcon />, external: true },
    github && { key: "github", label: "GitHub", href: github, icon: <GithubIcon />, external: true },
    { key: "whatsapp", label: "WhatsApp", href: `https://wa.me/${whatsapp}`, icon: <WhatsappIcon />, external: true },
    { key: "email", label: "Email", href: `mailto:${email}`, icon: <Mail strokeWidth={1.6} />, external: false },
  ].filter(Boolean) as { key: string; label: string; href: string; icon: React.ReactNode; external: boolean }[];

  return (
    <section id="contact" className="section overlap overlap-light" data-tone="light" aria-labelledby="contact-title">
      <div className="wrap contact">
        <p className="label" style={{ marginBottom: "1rem" }}>Contact</p>
        <div id="contact-title">
          <Headline as="h2" className="h1" lines={["Let's create something", "meaningful."]} />
        </div>

        <div className="contact-mailrow">
          <a className="contact-mail" href={`mailto:${email}`}>
            {email}
          </a>
          <CopyEmail email={email} />
        </div>

        <ul className="contact-icons" aria-label="Contact and social links">
          {links.map((l) => (
            <li key={l.key}>
              <a
                className="contact-icon"
                href={l.href}
                aria-label={l.label}
                {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {l.icon}
                <span className="contact-tip" aria-hidden>
                  {l.label}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <a className="contact-phone" href={`tel:${phoneE164}`}>
          <Phone aria-hidden size={16} strokeWidth={1.6} />
          {phoneDisplay}
        </a>
      </div>
    </section>
  );
}
