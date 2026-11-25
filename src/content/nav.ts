/** Site navigation. Every item scrolls to a section of the home page, except Contact which has its own page too. */
export const navItems = [
  { id: "home", label: "Home", href: "/" },
  { id: "beyond", label: "About", href: "/#beyond" },
  { id: "things-i-build", label: "Work", href: "/#things-i-build" },
  { id: "achievements", label: "Achievements", href: "/#achievements" },
  { id: "building", label: "NightBerrieZ", href: "/#building" },
  { id: "contact", label: "Contact", href: "/#contact" },
] as const;

export type SectionId = (typeof navItems)[number]["id"];
export const sectionIds: SectionId[] = navItems.map((n) => n.id);
