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
  /** Short uppercase statement for the map section and the case-study page. */
  headline?: string;
  /** Plain-words development status, taken from the project's own README. Shown on the case-study page. */
  statusNote?: string;
  /** Things still needed from the owner before more can be published. Never rendered. */
  todo?: string[];
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
    headline: "Read the light before you land.",
    summary: "An interactive lunar mission-support prototype: sunlight, Earth visibility and communication windows at the Moon's South Pole.",
    category: "Space",
    context: "NASA Space Apps Challenge 2026",
    status: "prototype",
    statusNote: "An independent research and educational prototype. It is not NASA-owned or endorsed, and emergency actions and spacecraft behaviour in it are simulations (from the project README).",
    overview: "At the lunar south pole the Sun skims the horizon and Earth hangs low. MoonNav traces both against real terrain and turns them into sunlight intervals, direct-to-Earth windows and comparisons for mission planners.",
    problem: "Landing missions are planned from observations, terrain data and predicted trajectories, but real conditions can differ from the plan. Direct contact with Earth can be blocked by terrain, a lander can drift off its trajectory, and the chosen landing zone can become unsuitable. Planners need to see the options quickly.",
    approach: "A web decision-support tool that combines terrain-aware analysis and 3D visualisation with simulated scenarios: relay-path geometry, trajectory deviation and propulsion assessment, and comparison of alternative landing sites, with unknown data reported as unknown rather than safe.",
    features: [
      "Terrain from LOLA laser altimetry, with lunar curvature",
      "Sun and Earth visibility checked against NAIF SPICE ephemerides and JPL Horizons",
      "Sunlight intervals and direct-to-Earth windows for chosen landing sites",
      "Simulated orbital-relay path: line of sight from lander to relay and from relay to Earth",
      "Trajectory deviation and emergency propulsion assessment with configurable vehicle assumptions",
      "Comparison of alternative landing sites by slope, illumination, Earth visibility and divert distance",
      "Simple and advanced views, light and dark themes",
    ],
    tech: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "React Three Fiber", "OpenLayers", "Apache ECharts", "Python 3.12", "FastAPI", "SpiceyPy (NAIF SPICE)", "PostgreSQL", "Drizzle ORM", "Supabase", "Better Auth", "Vitest", "Playwright"],
    links: { demo: "https://moonnav.vercel.app/", repo: "https://github.com/A-Mhd-Suhail/Nasa-Space-App" },
    screenshots: [
      { src: "/projects/moonnav/home.webp", alt: "MoonNav lunar south pole map with station sunlight and Earth visibility", width: 2000, height: 982, caption: "Landing-site readings for 15 Nov to 15 Dec 2026" },
    ],
    todo: ["Your exact contribution to MoonNav (not stated anywhere I can verify)", "More screenshots for the gallery"],
    visibility: "public",
  },
  {
    slug: "open-learning",
    name: "Open Learning",
    headline: "Learning should connect people, not just content.",
    summary: "An education platform for school learning and competitive exam preparation, built around connected student learning.",
    category: "Education",
    status: "in-progress",
    statusNote: "Still being built. Question Papers, Tests and Games are placeholders for now (from the project README).",
    overview: "A platform for school students and exam preparation (JEE and NEET) plus language learning, where learners study from structured video lessons and learn together in groups, with a permanent year-based Student ID created at sign-in.",
    problem: "Video lessons, groups and conversations usually live in different places. Students preparing for school exams, JEE and NEET end up studying alone with content that is not organised around them.",
    approach: "One account and one Student ID, structured video lessons by category and language, and group learning features alongside the content, with roles and access enforced in the database.",
    features: [
      "Video lessons by category: school, JEE, NEET and language learning",
      "A catalogue of 2,584 video records, imported from an Excel or Google Sheet template by an admin",
      "Student accounts with Google sign-in and an immutable, year-based Student ID",
      "Study groups, discussion and group chat",
      "Voice rooms and friend calls, using LiveKit",
      "Language Learning community: preferences, voice and chat rooms, posts and stories",
    ],
    planned: ["Question papers", "Tests", "Games"],
    tech: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "Supabase (auth, Postgres, storage)", "LiveKit", "Zod", "ExcelJS", "Vitest", "Playwright"],
    links: { demo: "https://opennlearning.vercel.app/", repo: "https://github.com/A-Mhd-Suhail/Open-Learning" },
    screenshots: [
      { src: "/projects/open-learning/home.webp", alt: "Open Learning home page with the student ID card", width: 2000, height: 1151, caption: "Student ID and learning tracks" },
    ],
    todo: ["Your exact contribution to Open Learning", "The 2,584 count is from the project's own spreadsheet, not from the live database. Recheck before quoting it elsewhere", "More screenshots for the gallery"],
    visibility: "public",
  },
  {
    slug: "united-medication",
    name: "United Medication",
    headline: "Healthcare without boundaries.",
    summary: "A healthcare portal prototype connecting patients, caretakers, doctors, hospitals and government administrators.",
    category: "Healthcare",
    status: "prototype",
    statusNote: "A prototype. It is not meant for real patient data without production security rules, encryption, consent management and compliance review (from the project README).",
    overview: "Healthcare without boundaries: one network where patients, caretakers, doctors, hospitals and government administrators work from a shared health identity and connected records, in a black, gold and white design.",
    problem: "Health information is split between patients, caretakers, doctors, hospitals and administrators, so each of them sees only a part of the care journey.",
    approach: "Five role-based portals on one shared identity and one record timeline, with Firebase authentication, role validation and Firestore-backed data.",
    features: [
      "Patient portal: appointments, cases, medicines, results, timeline, Health QR and emergency workflows",
      "Caretaker portal: assigned patients, medicine monitoring and care activities",
      "Doctor portal: cases, vitals, diagnoses, case notes and prescriptions",
      "Hospital portal: doctors, patients, appointments, billing and result upload",
      "Government admin portal: oversight of hospitals, doctors, patients and reports",
      "Ten interface languages, switched without a page reload",
      "Role-based sign-in with Firebase Authentication",
    ],
    tech: ["React 19", "TypeScript", "Vite", "Tailwind CSS 4", "Firebase Authentication", "Cloud Firestore", "Leaflet", "QRCode React", "SimpleWebAuthn"],
    links: { demo: "https://unitedmedication.vercel.app/", repo: "https://github.com/A-Mhd-Suhail/United-Medication" },
    screenshots: [
      { src: "/projects/united-medication/hero.webp", alt: "United Medication landing page: Healthcare Without Boundaries, over a hospital lobby", width: 2000, height: 1157, caption: "Healthcare Without Boundaries. One network, every health journey" },
    ],
    todo: ["Your exact contribution to United Medication", "More screenshots for the gallery"],
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
