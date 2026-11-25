import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Retired pages: their content now lives in the home page's scroll sections.
  async redirects() {
    return [
      { source: "/about", destination: "/#beyond", permanent: true },
      { source: "/work", destination: "/#things-i-build", permanent: true },
      { source: "/achievements", destination: "/#achievements", permanent: true },
      { source: "/work/open-learning", destination: "/work/naji-learning", permanent: true },
      { source: "/nightberriez", destination: "/#building", permanent: true },
    ];
  },
};

export default nextConfig;
