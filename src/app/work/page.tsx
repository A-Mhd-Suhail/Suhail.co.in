import type { Metadata } from "next";
import { Work } from "@/components/sections/Work";

export const metadata: Metadata = {
  title: "Selected work",
  description: "Selected software and web projects by Mohamed Suhail, with problems addressed, technologies used and links where they are live.",
  alternates: { canonical: "/work" },
};

export default function Page() {
  return <Work />;
}
