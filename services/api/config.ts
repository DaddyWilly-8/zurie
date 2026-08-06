const LIVE_API_BASE_URL = "https://test.weldtech.co.tz/api/v1";

export const API_BASE_URL = typeof window === "undefined" ? LIVE_API_BASE_URL : "/api/v1";

export const API_MODE = "laravel";

export const API_TIMEOUT_MS = 15_000;