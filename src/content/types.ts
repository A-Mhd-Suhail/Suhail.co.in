/**
 * Visibility controls what appears publicly.
 * - "public": shown everywhere.
 * - "draft":  shown only while running `npm run dev`, marked as a draft. Hidden in production.
 * ("teaser" is kept for older entries and is treated like "public" but with less detail.)
 */
export type Visibility = "public" | "teaser" | "draft";

export const isDev = process.env.NODE_ENV !== "production";

export function isShown(v: Visibility): boolean {
  return v !== "draft" || isDev;
}
