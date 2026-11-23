import type { Metadata } from "next";
import { About } from "@/components/sections/About";

export const metadata: Metadata = {
  title: "About",
  description: "About Mohamed Suhail: B.Tech in Computer Science and Engineering (Cyber Security), software projects, hackathons and engineering interests.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return <About />;
}
