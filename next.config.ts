import type { NextConfig } from "next";

// Same single source of truth as services/api/config.ts — Next.js loads
// .env.local automatically before this file runs, so setting
// NEXT_PUBLIC_API_ORIGIN there (local) or in the hosting platform's env vars
// (production) is enough; nothing here should ever hardcode a backend host.
const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN ?? "https://api.zurie.co.tz";
const apiOriginUrl = new URL(API_ORIGIN);

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: process.cwd(),
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_ORIGIN}/api/v1/:path*`,
      },
      {
        source: "/sanctum/:path*",
        destination: `${API_ORIGIN}/sanctum/:path*`,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: apiOriginUrl.protocol === "https:" ? "https" : "http",
        hostname: apiOriginUrl.hostname,
        port: apiOriginUrl.port || undefined,
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
