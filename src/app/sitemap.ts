import type { MetadataRoute } from "next";
import { profile } from "@/content/profile";
import { publicProjects } from "@/content/projects";

const routes = ["", "/about", "/work", "/achievements", "/nightberriez", "/contact"];

/** Every public route of the site. Add a route here when a new page is published. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const all = [...routes, ...publicProjects().map((p) => `/work/${p.slug}`)];
  return all.map((path) => ({
    url: `${profile.siteUrl}${path || "/"}`,
    lastModified,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
