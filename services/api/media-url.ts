import { API_ORIGIN } from "@/services/api/config";

// Matches a backend "public" disk URL on any host: http(s)://<host>[:port]/storage/<path>.
// The backend bakes APP_URL into every media URL at upload time
// (MediaService::store() stores Storage::disk()->url($path) verbatim), so a
// URL uploaded under a different APP_URL — http vs https, localhost vs
// 127.0.0.1, a missing :8000, a DB copied between environments — points at
// a host next/image's remotePatterns (next.config.ts, built from
// NEXT_PUBLIC_API_ORIGIN) doesn't allow, and the optimizer answers 400
// "url parameter is not allowed" -> blank image. S3 URLs never match (their
// keys don't start with /storage/), so they pass through untouched.
const BACKEND_STORAGE_URL = /^https?:\/\/[^/]+\/storage\//i;

const API_STORAGE_PREFIX = `${API_ORIGIN.replace(/\/+$/, "")}/storage/`;

/**
 * Re-points a backend storage URL at the API origin this app is actually
 * configured for. Anything else (relative paths, S3/CDN URLs, non-URL
 * strings) is returned unchanged.
 */
export const resolveMediaUrl = (value: string): string =>
  BACKEND_STORAGE_URL.test(value)
    ? value.replace(BACKEND_STORAGE_URL, API_STORAGE_PREFIX)
    : value;

/**
 * Deep-walks a parsed JSON response and applies resolveMediaUrl to every
 * string in it. Done once in apiClient rather than per service so no image
 * field (product images, category/brand/hero images, media library, order
 * line thumbnails, ...) can be missed.
 */
export const resolveMediaUrlsDeep = <T>(value: T): T => {
  if (typeof value === "string") {
    return resolveMediaUrl(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveMediaUrlsDeep(item)) as T;
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] = resolveMediaUrlsDeep(item);
    }
    return result as T;
  }
  return value;
};
