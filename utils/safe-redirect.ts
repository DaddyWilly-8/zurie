/**
 * Where to send the user after signing in, from a `?next=` value.
 *
 * Only same-site paths are allowed: anything else (`https://evil.example`,
 * `//evil.example`, `/\evil.example`, `javascript:...`) falls back to
 * `fallback`. Without this, a crafted sign-in link could bounce the user to
 * a phishing page, or run script on our origin, right after a real login.
 */
export const safeRedirectPath = (
  next: string | null | undefined,
  fallback: string,
): string => {
  if (!next) return fallback;
  const value = next.trim();
  // A single leading "/" followed by something other than "/" or "\" —
  // browsers treat "//host" and "/\host" as another site.
  if (!/^\/(?![/\\])/.test(value)) return fallback;
  // Control characters (tabs/newlines) are stripped by URL parsers and can
  // smuggle a scheme past the check above.
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;
  try {
    const url = new URL(value, "https://same-origin.invalid");
    if (url.origin !== "https://same-origin.invalid") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
};
