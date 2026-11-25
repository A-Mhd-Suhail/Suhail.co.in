import { Hero } from "@/components/hero/Hero";
import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Contact } from "@/components/sections/Contact";

const ticker = ["Developer", "Cybersecurity", "Hackathons", "Building NightBerrieZ", "Make it work", "Then break it"];

// Everything below the first screen is its own chunk, fetched and hydrated after the hero, so the first
// paint and the first interaction never wait for it. The HTML for each part is still rendered on the server.
const Journey = dynamic(() => import("@/components/journey/Journey").then((m) => m.Journey));
const Marquee = dynamic(() => import("@/components/ui/Marquee").then((m) => m.Marquee));
const Recognition = dynamic(() => import("@/components/sections/Recognition").then((m) => m.Recognition));
const Building = dynamic(() => import("@/components/sections/Building").then((m) => m.Building));

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <Hero />
      <Journey />
      <div className="overlap overlap-light" data-tone="light">
        <Marquee items={ticker} />
      </div>
      <Recognition />
      <Building />
      <Contact />
    </>
  );
}
