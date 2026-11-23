import type { Metadata } from "next";
import { Recognition } from "@/components/sections/Recognition";

export const metadata: Metadata = {
  title: "Achievements",
  description: "Hackathon participation, wins, certificates and technical events of Mohamed Suhail.",
  alternates: { canonical: "/achievements" },
};

export default function Page() {
  return <Recognition />;
}
