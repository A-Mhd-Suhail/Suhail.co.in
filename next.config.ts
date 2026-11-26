import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Inline the (small, gzip ~7KB) stylesheet in the HTML: one less round trip before first paint on slow links.
  experimental: { inlineCss: true },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 70, 75],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600],
    imageSizes: [96, 192, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  // Static files in /public are not fingerprinted, so they get a week with background revalidation;
  // fingerprinted /_next/static assets are already served as immutable by Next.
  async headers() {
    const cache = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }];
    return [
      { source: "/projects/:path*", headers: cache },
      { source: "/icons/:path*", headers: cache },
      { source: "/startup/:path*", headers: cache },
      { source: "/images/:path*", headers: cache },
      { source: "/apple-touch-icon.png", headers: cache },
    ];
  },
  // Retired pages: their content now lives in the home page's scroll sections.
  async redirects() {
    return [
      { source: "/about", destination: "/#beyond", permanent: true },
      { source: "/work", destination: "/#things-i-build", permanent: true },
      { source: "/achievements", destination: "/", permanent: false },
      { source: "/work/open-learning", destination: "/work/naji-learning", permanent: true },
      { source: "/nightberriez", destination: "/#building", permanent: true },
    ];
  },
};

export default nextConfig;
