import type { Visibility } from "./types";

export type { Visibility };

export type AchievementResult =
  | { kind: "winner"; label: string } // e.g. "Winner", "1st place", "Best Innovation Award"
  | { kind: "finalist"; label: string } // e.g. "Finalist", "Top 10"
  | { kind: "participant"; label?: string }; // shown as "Participant"

export interface Achievement {
  event: string;
  organizer?: string;
  year: number;
  result: AchievementResult;
  /** Name of the project built at the event. Can match a project name in projects.ts. */
  project?: string;
  /** Put the file in /public/certificates/ and reference it as "/certificates/file.webp". */
  certificate?: { src: string; alt: string; width: number; height: number };
  proofUrl?: string;
  visibility: Visibility;
}

/**
 * HACKATHONS & ACHIEVEMENTS
 * Add one object per event. Newest first is the order shown.
 * Use kind "participant" for events you took part in, "winner" only for real wins.
 *
 * Example (copy, fill in, set visibility to "public"):
 * {
 *   event: "Event name",
 *   organizer: "Organizer",
 *   year: 2025,
 *   result: { kind: "winner", label: "1st place" },
 *   project: "MoonNav",
 *   proofUrl: "https://...",
 *   visibility: "public",
 * },
 */
export const achievements: Achievement[] = [];

export function visibleAchievements(): Achievement[] {
  return achievements
    .filter((a) => a.visibility !== "draft" || process.env.NODE_ENV !== "production")
    .sort((a, b) => b.year - a.year);
}
