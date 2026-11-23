import type { MetadataRoute } from "next";
import { profile } from "@/content/profile";

/** Web app manifest: name, colours and the icon set used on phones and in browsers. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: profile.name,
    short_name: "Suhail",
    description: "Developer and cybersecurity student. Projects, hackathons and NightBerrieZ.",
    start_url: "/",
    display: "standalone",
    background_color: "#050506",
    theme_color: "#050506",
    icons: [
      { src: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { src: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
