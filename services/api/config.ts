// Single source of truth for which backend this app talks to. Set
// NEXT_PUBLIC_API_ORIGIN in .env.local for local dev (gitignored, never
// committed) and as a real environment variable in the hosting platform
// (Vercel project settings) for staging/production — never hardcode a
// backend URL here again.
const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN ?? "https://api.zurie.co.tz";

const LIVE_API_BASE_URL = `${API_ORIGIN}/api/v1`;

export const API_BASE_URL =
  typeof window === "undefined" ? LIVE_API_BASE_URL : "/api/v1";

export const API_MODE = "laravel";

export const API_TIMEOUT_MS = 15_000;
