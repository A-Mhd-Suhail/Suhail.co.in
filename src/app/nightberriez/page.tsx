import type { Metadata } from "next";
import { Building } from "@/components/sections/Building";

export const metadata: Metadata = { title: "NightBerrieZ" };

export default function Page() {
  return <Building />;
}
