const trimSlash = (value: string) => value.replace(/\/$/, "");

export const API_BASE_URL =
  trimSlash(process.env.NEXT_PUBLIC_API_URL || "") || "/api";

export const API_MODE =
  process.env.NEXT_PUBLIC_API_MODE === "laravel" ? "laravel" : "mock";

export const API_TIMEOUT_MS = 15_000;
