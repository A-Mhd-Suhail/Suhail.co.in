import type { Visibility } from "./types";

export type ProjectStatus = "completed" | "in-progress" | "prototype";

export interface Project {
  slug: string;
  name: string;
  /** One line, in plain words. */
  summary: string;
  category?: string;
  /** Hackathon or context the project was built for. */
  context?: string;
  /** Leave undefined until confirmed. Nothing is shown when undefined. */
  status?: ProjectStatus;
  year?: number;
  overview?: string;
  problem?: string;
  approach?: string;
  contribution?: string;
  /** Only features that are actually implemented. */
  features: string[];
  /** Planned ideas. Shown only in dev drafts, never publicly. */
  planned?: string[];
  tech: string[];
  links: {
    demo?: string;
    /** Public repositories only. Never put private repo URLs here. */
    repo?: string;
  };
  /** Files go in /public/projects/<slug>/. src example: "/projects/<slug>/home.webp" */
  screenshots: { src: string; alt: string; width: number; height: number; caption?: string }[];
  visibility: Visibility;
}

/**
 * HOW TO PUBLISH A PROJECT
 * 1. Fill in status, overview, features (implemented only), tech, links and screenshots.
 * 2. Change visibility to "public".
 * Everything with visibility "draft" is hidden in production and marked as a draft in dev.
 * Order in this array = order on the Work page.
 */
export const projects: Project[] = [
  {
    slug: "moonnav",
    name: "MoonNav",
    summary: "Reads sunlight and Earth visibility at the lunar south pole, to plan landings.",
    category: "Space",
    context: "NASA Space Apps",
    overview: "At the lunar south pole the Sun skims the horizon and Earth hangs low. MoonNav traces both against the real terrain and turns them into sunlight intervals, direct-to-Earth windows and comparisons.",
    features: [
      "Terrain from LOLA laser altimetry, with lunar curvature",
      "Sun and Earth visibility checked against NAIF SPICE ephemerides and JPL Horizons",
      "Sunlight intervals and direct-to-Earth windows for chosen landing sites",
      "Simple and advanced views, light and dark themes",
    ],
    planned: [
      "Lunar mission support",
      "Mission emergency and recovery concepts",
    ],
    tech: [],
    links: { demo: "https://moonnav.vercel.app/" },
    screenshots: [
      { src: "/projects/moonnav/home.webp", alt: "MoonNav lunar south pole map with station sunlight and Earth visibility", width: 2000, height: 1151, caption: "Landing-site readings for 15 Nov to 15 Dec 2026" },
    ],
    visibility: "public",
  },
  {
    slug: "open-learning",
    name: "Open Learning",
    summary: "An education platform for school students and competitive exam preparation.",
    category: "Education",
    overview: "A platform that brings students together to learn, share knowledge, build connections and grow together, with a permanent Student ID created at sign-in.",
    features: [
      "Video lessons",
      "Study groups",
      "Voice and chat rooms",
      "Language practice",
      "Student ID and open-to-you tracks for school, JEE, NEET and language learning",
    ],
    tech: [],
    links: { demo: "https://opennlearning.vercel.app/" },
    screenshots: [
      { src: "/projects/open-learning/home.webp", alt: "Open Learning home page with the student ID card", width: 2000, height: 982, caption: "Student ID and learning tracks" },
    ],
    visibility: "public",
  },
  {
    slug: "united-medication",
    name: "United Medication",
    summary: "An internationally digitalised healthcare network, one place for patients, doctors, hospitals and government.",
    category: "Healthcare",
    overview: "Healthcare without boundaries: one network that connects patients, caretakers, doctors, hospitals and government administrators.",
    features: [
      "Patient-owned health identity, records, medicines and care journey",
      "Caretaker coordination of medicines, care tasks and patient updates",
      "Doctor review of verified records, vitals and prescriptions",
      "Hospital operations management for doctors, patients, records and appointments",
      "Government oversight of hospitals, doctors, patients and appointments",
      "English and other language selection",
    ],
    tech: [],
    links: { demo: "https://unitedmedication.vercel.app/" },
    screenshots: [
      { src: "/projects/united-medication/hero.webp", alt: "United Medication landing page: Healthcare Without Boundaries, over a hospital lobby", width: 2000, height: 1157, caption: "Healthcare Without Boundaries. One network, every health journey" },
    ],
    visibility: "public",
  },
];

export function publicProjects(): Project[] {
  return projects.filter((p) => p.visibility === "public");
}

/** Public projects, plus drafts while developing. */
export function visibleProjects(): Project[] {
  return projects.filter((p) => p.visibility === "public" || (p.visibility === "draft" && process.env.NODE_ENV !== "production"));
}
