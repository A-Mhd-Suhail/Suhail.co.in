/**
 * "Things I build" map section. Copy is editable here; project facts come from projects.ts.
 * `node` is a visual position on the map only. It is a composition choice, not a claim about where a project lives.
 */
export const network = {
  title: "Things I build",
  subtitle: "From ambitious ideas to working products. A collection of projects, experiments and technology-driven solutions.",
  /** Order matters: it is the order the projects appear on the home page. */
  stops: [
    {
      slug: "naji-learning",
      node: "in",
      blurb: "An education platform exploring structured learning resources, competitive exam preparation and connected student learning experiences.",
    },
    {
      slug: "moonnav",
      node: "moon",
      blurb: "An interactive lunar mission-support experience exploring illumination, landing-site conditions and communication opportunities at the Moon's South Pole.",
    },
    {
      slug: "united-medication",
      node: "med",
      blurb: "A healthcare portal prototype connecting patients, caretakers, doctors, hospitals and government administrators through a shared health identity.",
    },
  ],
} as const;
