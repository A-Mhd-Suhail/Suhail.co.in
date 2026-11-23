/**
 * Social profiles. Paste your real profile URL into `url`.
 * Any entry with an empty url is hidden everywhere on the site.
 */
export interface SocialLink {
  label: string;
  url: string;
}

export const socialLinks: SocialLink[] = [
  { label: "GitHub", url: "https://github.com/A-Mhd-Suhail" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/mhdsuhail2007/" },
  { label: "Instagram", url: "" },
  { label: "X", url: "" },
];

export const visibleSocialLinks = socialLinks.filter((s) => s.url.trim() !== "");
