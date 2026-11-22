import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { profile } from "@/content/profile";
import { Providers } from "@/components/Providers";
import { Preloader } from "@/components/shell/Preloader";
import { Header } from "@/components/shell/Header";
import { ScrollIndicator } from "@/components/shell/ScrollIndicator";
import { Footer } from "@/components/shell/Footer";
import { SmoothScroll } from "@/components/shell/SmoothScroll";
import "./globals.css";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

const description =
  "Mohamed Suhail is a developer and cybersecurity student in India. Software projects, hackathons and an initiative called NightBerrieZ.";

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: { default: `${profile.name} | Developer and cybersecurity student`, template: `%s | ${profile.name}` },
  description,
  authors: [{ name: profile.name }],
  openGraph: { title: profile.name, description, type: "profile", locale: "en_IN" },
  twitter: { card: "summary", title: profile.name, description },
};

export const viewport: Viewport = { themeColor: "#050506" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <noscript>
          <style>{`.preloader{display:none!important}main [style*="opacity: 0"],main [style*="opacity:0"]{opacity:1!important;transform:none!important}.mask>span,.hero2-line>span,.rise{transform:none!important;opacity:1!important}.header{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Providers>
          <Preloader />
          <SmoothScroll />
          <Header />
          <ScrollIndicator />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
