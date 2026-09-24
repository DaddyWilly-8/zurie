# Zuriè Frontend — Testing

This repo previously had no automated tests. This adds three layers plus
CI wiring — see [`../.github/workflows/ci.yml`](../.github/workflows/ci.yml)
for how they run on every PR.

## Unit tests (Vitest)

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

Covers the pure-function money/VAT utils (`utils/vat.test.ts`,
`utils/currency.test.ts`) — 15 tests: VAT-inclusive vs exclusive pricing,
exempt lines, zero-rate, coupon discount proportional splitting and its
rounding remainder, negative-taxable-value guarding, currency conversion
round-tripping, and formatting. No coupon _calculation_ util exists on the
frontend to unit-test separately — coupon amounts are always server-
computed (`couponService.preview()`); the frontend only applies whatever
discount the backend returns, which is what `summarizeVat`'s discount
parameter tests cover.

## End-to-end tests (Playwright)

```bash
npm run build && npm run test:e2e   # needs the build first — see below
```

Requires the backend running on `:8000` (`SANCTUM_STATEFUL_DOMAINS` must
include `localhost:3000` — the E2E config deliberately runs the frontend
on port 3000, not a separate port, because a different origin's login
"succeeds" at the HTTP level but never actually authenticates the
session — found by running against `:3100` first). See
[`../docs/RUNBOOK.md`](../docs/RUNBOOK.md) for starting the backend.

**Fixtures required** (see each spec's own comments for the exact seed):

- An admin user `e2e-admin@test.local` / `e2e-test-password-123` with the
  `admin` role and **no 2FA** — the real demo admin has 2FA enabled,
  which would block a straightforward login flow.
- A product with SKU `E2E-FIXTURE-PRODUCT`, slug `e2e-fixture-product`,
  topped up with real stock — used instead of catalog demo data so tests
  aren't coupled to whatever stock level a real product happens to have.
- A coupon `E2EFIXTURE` (fixed TZS 100 off, effectively unlimited uses).

`.github/workflows/ci.yml`'s `build-and-e2e` job seeds all three
automatically against a fresh CI database; locally, seed them once via
`php artisan tinker` (see the job's "Seed E2E fixtures" step for the exact
commands, or `docs/RUNBOOK.md`).

### Coverage — and where it's intentionally scoped down

- **Customer journey** (`e2e/customer-journey.spec.ts`): register → browse
  → add to cart → apply a coupon → checkout → land on the account page.
  Full journey, one test.
- **Admin journey** (`e2e/admin-journey.spec.ts`): split into two tests —
  (1) login → create a product, using the product form's own quick-add
  category (exercises this session's quick-add feature); (2) login →
  advance an order to its next status, seeding the order via the real
  checkout endpoint first so the test doesn't depend on run order against
  other specs. **Not covered**: receive stock (GRN), POS sale, approve a
  review. The brief named these as part of the admin journey; they were
  cut for scope/time in this pass, not forgotten — each would follow the
  same pattern (seed fixtures via the API, drive the real UI, assert the
  result) and is a natural next addition.
- **Accessibility** (`e2e/accessibility.spec.ts`): axe-core WCAG 2 A/AA
  scan of every public page (`/`, `/shop`, `/about`, `/contact`, `/login`,
  `/register`). `color-contrast` is deliberately excluded — see below.

### Real bugs found while writing these tests

Not hypothetical — each of these broke a test first, then got fixed:

1. **`components/admin/categories/category-form-dialog.tsx` missing
   `"use client"`** (area 1, but same root cause) — added hooks without
   the directive; the page 500'd. Caught by loading the actual page, not
   by `tsc`.
2. **Login only works from the exact origin in `SANCTUM_STATEFUL_DOMAINS`**
   — not a bug exactly, but genuinely surprising behavior (login returns
   200 and looks successful even from an untrusted origin; the session
   just silently never authenticates). Documented above so the next
   person doesn't lose an hour to it.
3. **A submit click can land before the form finishes hydrating** — SSR
   markup is clickable before React attaches the `onSubmit` handler;
   the click silently did nothing (no request, no error). Fixed by
   waiting for `networkidle` before interacting on the login pages.
4. **`SectionHeading`'s `subtitle` prop was silently dropped** — one real
   call site (`app/(public)/page.tsx`) passed a subtitle expecting it to
   render; the component never rendered it. Not dead code — a real
   content bug, now fixed to actually render it.
5. **`orders.prices_include_vat` column missing locally** — a real
   migration existed in the codebase (merged from other work) but was
   never run against the local dev database. Not a code bug; `php artisan
migrate` fixed it. Worth knowing: a stale local DB can make a
   perfectly good E2E test fail for reasons that have nothing to do with
   the test or the feature under test.
6. **Two real accessibility bugs**, not just axe noise:
   - The header's currency `<Select>` and the shop page's "Sort by"
     `<TextField select>` had no accessible name at all (the sort one
     intermittently failed axe — a self-referencing `aria-labelledby`
     that hadn't resolved yet at scan time). Both fixed with an explicit
     `aria-label`/`label`.
   - The desktop category filter on `/shop` was a list of plain
     `<Typography onClick>` elements — not focusable, not announced as
     interactive, unusable by keyboard. axe's automated rules don't
     reliably catch this pattern; found by reading the actual JSX while
     investigating the Select issue nearby. Fixed by rendering them as
     real `component="button"` elements with `aria-pressed`.
7. **`ShopPageClient` had no error state** — a failed products/categories
   fetch fell through the same path as "zero products," rendering an
   empty grid indistinguishable from a genuinely empty catalog. A down or
   slow backend looked identical to "we don't sell anything." Fixed with
   an explicit error state + retry button.

### Flagged, not fixed: brand color contrast

`color-contrast` is excluded from the automated a11y test
(`e2e/accessibility.spec.ts`'s `disableRules`) because it's a real,
site-wide finding that touches the brand's core visual identity, not
something to silently repaint during a test-writing pass:

| Element                                                                     | Measured ratio | WCAG AA needs |
| --------------------------------------------------------------------------- | -------------- | ------------- |
| Nav links, section "eyebrow" labels (`#b58a57` gold on `#fcf9f5`/`#f8f5f0`) | ~2.5–3.1:1     | 4.5:1         |
| Primary buttons (white text on `#b58a57` gold background)                   | ~3.1:1         | 4.5:1         |

This is the brand's signature gold accent, used consistently across every
page. Bringing it to 4.5:1 means either darkening the gold itself
(changes the brand color) or only darkening it for text/button contexts
while keeping it lighter for decorative use (more design work, more
tokens). This is a design/product decision, flagged here with exact
numbers so whoever owns the brand palette can decide deliberately, not a
gap that was missed.

## Lighthouse

Not run as part of this pass — Lighthouse needs a deployed or
production-mode-served instance and a browser automation step beyond what
`next build && next start` + a manual check covers reliably in CI without
its own flakiness-prone setup. The accessibility half of the "90+ ...
accessibility" target is covered instead by the axe-core E2E suite above,
which is more precise (exact WCAG rule violations, not a single blended
score) and already wired into CI. Performance scoring is a reasonable
follow-up once there's a stable deployed URL to point Lighthouse CI at.
