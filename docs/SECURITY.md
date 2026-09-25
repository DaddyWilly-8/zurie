# Zuriè Frontend — Security Review

Area 4 of the ops/security review. See the backend's own security notes
(area 4 there) for the API-side half of this pass.

## Security headers

`next.config.ts`'s `headers()` now sets, on every route:

| Header                      | Value                                                                | Why                                                                                    |
| --------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `X-Frame-Options`           | `SAMEORIGIN`                                                         | already present                                                                        |
| `X-Content-Type-Options`    | `nosniff`                                                            | already present                                                                        |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                                    | already present                                                                        |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload`                       | new — forces HTTPS for two years including subdomains                                  |
| `Permissions-Policy`        | camera/microphone/geolocation/payment/usb/interest-cohort all denied | new — this app uses none of them; denies them even to a compromised third-party script |
| `Content-Security-Policy`   | see below                                                            | new                                                                                    |

### Content-Security-Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: blob: https://images.unsplash.com <API_ORIGIN>;
connect-src 'self' <API_ORIGIN> https://www.google-analytics.com https://open.er-api.com;
frame-ancestors 'self';
base-uri 'self';
form-action 'self';
object-src 'none';
```

**`'unsafe-inline'` on `script-src` is a known, deliberate trade-off, not
an oversight.** Next.js's App Router ships its hydration payload as
inline `<script>` tags on every page, and MUI/Emotion injects inline
`<style>` tags at runtime — both would break the entire app (nothing
would hydrate or render styled) without it. The stricter alternative is a
nonce-based CSP: middleware generates a per-request nonce, the response
header and Next's own injected scripts both carry it, and `'unsafe-inline'`
is dropped entirely. That needs its own careful rollout (Next has a
documented pattern for it) and its own live-browser verification the same
way this pass verified the current policy — flagged as a real follow-up,
not silently skipped.

**Verified for real, not just written**: built the app, served it with
`next start`, and loaded every public page plus `/admin/login`, `/admin`,
`/cart`, `/forgot-password`, `/reset-password`, and `/policies` in a real
headless Chromium instance, watching the console for CSP violations.
First pass caught a real one — the live USD exchange-rate widget
(`hooks/use-currency-store.ts`, fetches `open.er-api.com` client-side) was
silently blocked, which would have broken currency conversion for every
visitor on deploy. Added to `connect-src`, re-verified: zero violations
across every page checked.

Update this list whenever a new third-party origin is added anywhere in
the app (a new analytics tool, a new API the browser calls directly, a new
font/image host) — a page that works in dev but silently drops a feature
in production is exactly what an untested CSP looks like.

**Known gap**: once the Sentry frontend integration (a separate, earlier
PR — `ops/deploy-runbook-sentry`) merges, Sentry's ingest origin needs
adding to `connect-src`, or error reports will be silently blocked by this
policy. Not added preemptively here since that PR hasn't merged yet and
the exact ingest URL depends on which Sentry project gets created.

## Dependency scanning

- **`npm audit`**: found postcss (bundled inside `next@15.5.25`) with two
  high and two moderate advisories — arbitrary file disclosure via a
  crafted `sourceMappingURL` in CSS, and an XSS-via-unescaped-`</style>`
  stringify bug. Real risk here is low (postcss only ever processes this
  app's own authored CSS/Tailwind at build time — never user- or
  attacker-controlled CSS), but cheap to fix: added `"overrides":
{"postcss": "^8.5.28"}` to `package.json`, forcing the patched version
  even though `next` itself still declares an older range. Verified the
  build still succeeds with the override in place (`next build` completed
  clean). `npm audit` now reports 0 vulnerabilities.
- **`composer audit`** (backend): 0 advisories.
- Neither is wired into CI yet in this PR — see the open item below.

## Other checks performed

- **Open redirect**: every `?next=` redirect target (admin login,
  customer login) already routes through `utils/safe-redirect.ts` before
  being passed to `router.push()`. No other client-side navigation reads
  a redirect target from user-controlled input.
- **XSS via `dangerouslySetInnerHTML`**: the only usage in the app
  (`app/(public)/page.tsx`'s JSON-LD schema script) already escapes `<`
  in the stringified output — pre-existing hardening from an earlier
  pass, confirmed still in place, not something this pass needed to fix.
- **`eval`/`new Function`**: none in the codebase.

## Backend findings (fixed)

- **Every unauthenticated API request without an explicit `Accept:
application/json` header returned a raw 500, not a clean 401.**
  Laravel's default `Authenticate` middleware only skips its
  redirect-to-login behavior when the request "expects JSON"; anything
  else — a plain `curl` call, a bot, a misconfigured client, or literally
  the first request of an authorization-sweep tool — fell into the
  redirect path, which tried to build a URL for a named `login` route
  that doesn't exist in this API-only app, throwing
  `RouteNotFoundException`. `CLAUDE.md`'s own cheatsheet documents this as
  an accepted gotcha ("`Route [login] not defined` (500) — request was
  unauthenticated, not a routing bug") but it was never actually fixed at
  the code level. Fixed in `bootstrap/app.php` with
  `Authenticate::redirectUsing(fn () => null)`, forcing every
  unauthenticated request to always throw `AuthenticationException`
  instead — already mapped to the standard `{ success: false, message:
"Unauthenticated." }` 401 JSON response. Verified live:
  `GET /api/v1/admin/orders`, `/admin/users`, and `/account/profile`
  (customer guard) with zero auth all now return a clean 401 instead of a 500. Full suite still green after the change.
- **IDOR audit**: every customer-scoped endpoint (`GET /account/profile`,
  `GET /account/orders`) derives identity entirely from
  `$request->user('customer')` — never a client-supplied ID — so there is
  no order/profile enumeration surface on the customer side. All
  admin-gated routes require `permission:*` middleware; spot-checked
  several (`admin/orders`, `admin/users`,
  `admin/finance/chart-of-accounts`) with zero auth and got the 401 above,
  not the resource.
- **Login/forgot-password enumeration**: verified live with curl —
  `POST /auth/forgot-password` returns an identical `{success:true}` for
  a real vs. a nonexistent email (admin guard); `POST /auth/login` and
  `POST /customer/auth/login` return the identical validation error
  message ("These credentials do not match our records.") for a wrong
  password vs. a nonexistent email. No account existence is leaked
  anywhere in the auth flow.
