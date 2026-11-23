import type { Metadata } from "next";
import { Contact } from "@/components/sections/Contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Mohamed Suhail by email or phone.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return <Contact />;
}
