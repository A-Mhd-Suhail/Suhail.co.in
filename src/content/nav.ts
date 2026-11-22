/** Site navigation. Each item is its own page; "Home" is the full landing page. */
export const navItems = [
  { id: "home", label: "Home", href: "/" },
  { id: "about", label: "About", href: "/about" },
  { id: "work", label: "Work", href: "/work" },
  { id: "achievements", label: "Achievements", href: "/achievements" },
  { id: "building", label: "NightBerrieZ", href: "/nightberriez" },
  { id: "contact", label: "Contact", href: "/contact" },
] as const;

export type SectionId = (typeof navItems)[number]["id"];
export const sectionIds: SectionId[] = navItems.map((n) => n.id);
