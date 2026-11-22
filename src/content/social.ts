/**
 * Social profiles. Paste your real profile URL into `url`.
 * Any entry with an empty url is hidden everywhere on the site.
 */
export interface SocialLink {
  label: string;
  url: string;
}

export const socialLinks: SocialLink[] = [
  { label: "GitHub", url: "" },
  { label: "LinkedIn", url: "" },
  { label: "Instagram", url: "" },
  { label: "X", url: "" },
];

export const visibleSocialLinks = socialLinks.filter((s) => s.url.trim() !== "");
