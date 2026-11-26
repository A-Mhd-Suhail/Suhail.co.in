import { Hero } from "@/components/hero/Hero";
import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Contact } from "@/components/sections/Contact";
import { Projects } from "@/components/sections/Projects";

// The sections around the projects are their own chunks, fetched and hydrated after the hero, so the first
// paint and the first interaction never wait for them. The HTML for each part is still rendered on the server.
const Journey = dynamic(() => import("@/components/journey/Journey").then((m) => m.Journey));
const Building = dynamic(() => import("@/components/sections/Building").then((m) => m.Building));

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <Hero />
      <Journey />
      <Projects />
      <Building />
      <Contact />
    </>
  );
}
