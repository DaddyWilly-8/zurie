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
  // Shared/managed hosting (CloudLinux LVE) caps how many processes and
  // threads the account may spawn. Next's default build fans out one
  // page-rendering worker per CPU, which trips that cap on the live box
  // ("pthread_create: Resource temporarily unavailable" during "Collecting
  // page data"). One worker, no extra threads, keeps the build inside the
  // limit; it's a little slower but doesn't affect the running site.
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
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
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Locks down every browser feature this app doesn't use — a
          // compromised or malicious third-party script (ad, widget,
          // dependency) can't ask for the camera/mic/geolocation/etc, even
          // if it otherwise got past the CSP below.
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // 'unsafe-inline' is required here, not a leftover: Next.js's
              // App Router hydration payload ships as inline <script>
              // tags on every page, and MUI/Emotion injects inline
              // <style> tags at runtime — both would break the entire
              // app (nothing would hydrate or be styled) without it.
              // Moving to a nonce-based CSP is the stricter alternative,
              // but needs per-request middleware wiring and its own
              // careful rollout — flagged as a follow-up, not silently
              // skipped.
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              `img-src 'self' data: blob: https://images.unsplash.com ${apiOriginUrl.origin}`,
              // open.er-api.com: the live USD exchange-rate source
              // (hooks/use-currency-store.ts) — found missing from this
              // policy by actually loading the site in a browser and
              // watching for CSP violations, not just reading the code
              // that builds the header.
              `connect-src 'self' ${apiOriginUrl.origin} https://www.google-analytics.com https://open.er-api.com`,
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
