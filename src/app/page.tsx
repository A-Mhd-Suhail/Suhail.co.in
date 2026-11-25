import { Hero } from "@/components/hero/Hero";
import { Beyond } from "@/components/beyond/Beyond";
import { Network } from "@/components/network/Network";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Marquee } from "@/components/ui/Marquee";
import { Recognition } from "@/components/sections/Recognition";
import { Building } from "@/components/sections/Building";
import { Contact } from "@/components/sections/Contact";

const ticker = ["Developer", "Cybersecurity", "Hackathons", "Building NightBerrieZ", "Make it work", "Then break it"];

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <Hero />
      <Beyond />
      <Network />
      <div className="overlap overlap-light" data-tone="light">
        <Marquee items={ticker} />
      </div>
      <Recognition />
      <Building />
      <Contact />
    </>
  );
}
