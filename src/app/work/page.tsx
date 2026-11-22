import type { Metadata } from "next";
import { Work } from "@/components/sections/Work";

export const metadata: Metadata = { title: "Selected work" };

export default function Page() {
  return <Work />;
}
