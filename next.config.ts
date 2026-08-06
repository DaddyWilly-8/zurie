import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: process.cwd(),
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://test.weldtech.co.tz/api/v1/:path*",
      },
      {
        source: "/sanctum/:path*",
        destination: "https://test.weldtech.co.tz/sanctum/:path*",
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
        protocol: "https",
        hostname: "test.weldtech.co.tz",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
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
