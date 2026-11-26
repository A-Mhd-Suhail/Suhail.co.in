import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { profile } from "@/content/profile";
import { visibleSocialLinks } from "@/content/social";
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
  // Not preloaded: they would compete with the stylesheet on slow connections. Text paints at once in a
  // metric-matched fallback and swaps when the font arrives, behind the intro curtain.
  preload: false,
});
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap", preload: false });

const description =
  "Mohamed Suhail is a Cyber Security student at VIT University, India. Software projects, hackathons and an initiative called NightBerrieZ.";

const siteName = profile.name;
const iconImage = "/icons/icon-512.png";

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  alternates: { canonical: "/" },
  applicationName: siteName,
  title: { default: `${profile.name} | Cyber Security VIT University`, template: `%s | ${profile.name}` },
  description,
  authors: [{ name: profile.name, url: profile.siteUrl }],
  creator: profile.name,
  // Explicit and permissive, matching robots.txt.
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  // Favicon set: the metallic S. Sizes are multiples of 48px, as Google requires for search results.
  icons: {
    icon: [
      { url: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: profile.name,
    description,
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName,
    images: [{ url: iconImage, width: 512, height: 512, alt: `${profile.name} logo` }],
  },
  twitter: { card: "summary", title: profile.name, description, images: [iconImage] },
};

/** Structured data: tells search engines who this site is about. Only verified facts. */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${profile.siteUrl}/#website`,
      url: profile.siteUrl,
      name: siteName,
      description,
      inLanguage: "en",
    },
    {
      "@type": "Person",
      "@id": `${profile.siteUrl}/#person`,
      name: profile.name,
      url: profile.siteUrl,
      alternateName: "Mohamed Suhail A",
      jobTitle: "Full Stack Developer & Cyber Security Enthusiast",
      affiliation: { "@type": "CollegeOrUniversity", name: "VIT-AP University" },
      sameAs: visibleSocialLinks.map((s) => s.url),
      image: `${profile.siteUrl}${iconImage}`,
      description,
    },
  ],
};

export const viewport: Viewport = { themeColor: "#050506", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <noscript>
          <style>{`.preloader{display:none!important}main [style*="opacity: 0"],main [style*="opacity:0"]{opacity:1!important;transform:none!important}.mask>span,.hero2-line>span,.rise{transform:none!important;opacity:1!important}.header{opacity:1!important;transform:none!important}.beyond{height:auto!important}.beyond-sticky{position:relative!important;height:auto!important;padding:8rem 1.5rem 4rem}.beyond-title,.beyond-copy,.beyond-photo{position:relative!important;inset:auto!important;transform:none!important;width:auto!important;opacity:1!important}.rv{grid-area:auto!important;opacity:1!important;transform:none!important}.beyond-pager{display:none}`}</style>
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
