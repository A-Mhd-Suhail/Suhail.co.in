import type { Metadata } from "next";
import { Recognition } from "@/components/sections/Recognition";

export const metadata: Metadata = { title: "Achievements" };

export default function Page() {
  return <Recognition />;
}
