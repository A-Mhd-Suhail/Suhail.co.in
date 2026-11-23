import type { Metadata } from "next";
import { Building } from "@/components/sections/Building";

export const metadata: Metadata = {
  title: "NightBerrieZ",
  description: "NightBerrieZ, a venture Mohamed Suhail is building, and an invitation to collaborate.",
  alternates: { canonical: "/nightberriez" },
};

export default function Page() {
  return <Building />;
}
