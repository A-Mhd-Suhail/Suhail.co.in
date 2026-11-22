import { Hero } from "@/components/hero/Hero";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Marquee } from "@/components/ui/Marquee";
import { About } from "@/components/sections/About";
import { Work } from "@/components/sections/Work";
import { Recognition } from "@/components/sections/Recognition";
import { Building } from "@/components/sections/Building";
import { Contact } from "@/components/sections/Contact";

const ticker = ["Developer", "Cybersecurity", "Hackathons", "Building NightBerrieZ", "Make it work", "Then break it"];

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <Hero />
      <div className="overlap overlap-light" data-tone="light">
        <Marquee items={ticker} />
      </div>
      <About />
      <Work />
      <Recognition />
      <Building />
      <Contact />
    </>
  );
}
