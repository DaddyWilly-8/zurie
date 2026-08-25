# Zuriè Frontend — CLAUDE.md

Read this before exploring the repo from scratch. It exists so a future session
doesn't have to re-derive the structure, the API contract, or the backend
situation by reading every file again.

## The one rule that matters most

**There is no local backend in this repo, and there never should be one added
here.** The `backend/` folder that used to sit next to `frontend/` has been
deleted. Do not create one, do not assume `php artisan serve` is running, do
not go looking for Laravel source to cross-reference. This repo talks to a
**remote** Laravel API only.

**`docs/development-guide.md` is the single source of truth for that API.**
It is the full v2.24 contract: every endpoint, request/response shape,
validation rule, and a "Changes from vX.X" changelog at the end explaining
_why_ things are shaped the way they are. Read it before touching any
`services/*.service.ts` file, any admin CRUD screen, or anything settings-
related. When frontend code and that doc disagree, the doc wins — fix the
frontend, don't "fix" the doc to match broken code.

Key things from that doc worth internalizing up front:

- Auth is Sanctum **cookie-based** SPA auth, not bearer tokens. Every mutating
  request needs a prior `GET /sanctum/csrf-cookie` call and `credentials:
include` — already handled centrally in `services/api/client.ts`, don't
  reimplement this per-service.
- Every response is one of exactly four envelope shapes (single resource,
  paginated list, `{success:true}` ack, or error) — see doc §1.
- Admin routes are namespaced under `admin/`; public/storefront routes are
  not. Public product responses nest a full `category` object; admin product
  responses only carry `categoryId` — this is deliberate, not a bug.
- Settings (§8) has four independent categories — `brand`, `contact`,
  `homepage`, `policies` — each with its own `GET`/`PUT`
  `/admin/settings/{category}`, plus two multipart upload endpoints
  (`brand/logo`, `homepage/hero-image`). `contact`'s three arrays
  (`phones`/`emails`/`socialLinks`) must **all** be sent together on every
  `PUT`, even to change just one.
- **A settings category that's never been saved resolves to `{}`** (or
  missing array keys), not a fully-populated object. Every `contentService`
  getter in `services/content/content.service.ts` normalizes this — always
  add a default when adding a new field there, don't assume the backend
  response is complete.
- Product pricing is `price` + optional `salePrice` (`salePrice` must be
  `<= price`). **Display rule**: if `salePrice` is present, show it as the
  active price with `price` struck through; if `salePrice` is `null`, show
  `price` alone. `buyingPrice` is admin-only and never appears in any public
  product response — don't expose it on storefront pages.
- **The backend's base currency is TZS.** Every price field the backend
  stores or returns (`price`, `salePrice`, `buyingPrice`) is a plain TZS
  number — there is no per-currency storage. `utils/currency.ts` is the
  single source of truth for converting between TZS and whatever currency
  the admin/customer currently has selected (`useCurrencyStore`):
  `convertToBaseCurrency` turns a typed amount (in the selected currency)
  into TZS before it's sent anywhere; `convertFromBaseCurrency`/
  `formatBaseCurrencyInCurrency` turn a stored TZS amount into the selected
  currency for display. Any new money input field must call
  `convertToBaseCurrency` before saving — see `product-fields.tsx`'s
  `decimalFieldProps` or `features/admin/products/pricing-popover.tsx` for
  the pattern. Never compare or send a raw typed number without converting
  it first (it was previously sent straight to the backend as if it were
  TZS — see git history on `pricing-popover.tsx`).

## Directory map (as of this reorg)

```
app/
  (public)/        storefront: /, /shop, /shop/[slug], /categories/[slug],
                    /cart, /contact, /about, /policies
  (admin)/admin/    admin dashboard: overview, products, categories, orders,
                    customers, enquiries, faq, media, settings, users, activity
  (auth)/           /admin/login, /admin/forgot-password, /reset-password
                    (reset-password is intentionally NOT under /admin — the
                    backend emails a plain /reset-password link, see doc §2.3)

features/           one folder per domain, each following the same shape:
  admin/<domain>/   <domain>-client.tsx, <domain>-actions.ts, types.ts,
                    index.ts (barrel), plus tables/dialogs as needed
  shop/, cart/, contact/   public-facing feature components

services/
  api/              client.ts (axios + Sanctum CSRF handling), config.ts
                    (base URL — remote only), endpoints.ts (single source of
                    truth for every path)
  <domain>/<domain>.service.ts   one per backend module, thin wrappers over
                    apiClient that mirror the doc's endpoints exactly
  content/content.service.ts     §8 Settings — see normalization note above

components/
  admin/            shared admin UI: AdminField, AdminImageUploader,
                    AdminFeedbackSnackbar, AdminShell (sidebar/topbar), guard
  site-header*, site-footer.tsx, product-card.tsx   shared public UI

providers/
  settings-provider.tsx   fetches GET /settings once, exposes useSiteSettings()
                    — brand/contact/homepage/policies + convenience getters
                    (whatsappNumber, phoneNumber, emailAddress, socialLinks).
                    This is how public pages get dynamic content — never
                    hardcode brand name/contact info/hero copy in a public
                    page, pull it from here (or contentService.getPublicSettings()
                    directly in a server component).
  app-providers.tsx, query-provider.tsx (TanStack Query), theme-provider.tsx

hooks/
  use-shop-store.ts       Zustand + persist — cart/wishlist/recentlyViewed
  use-currency-store.ts   Zustand + persist — selected currency + FX rates
  use-admin-auth.ts       drives AdminAuthGuard, calls GET /auth/user

types/
  product.ts    Product/CartItem/ProductCategory (defensively accepts both
                camelCase and snake_case category fields from the API)
  content.ts    §8 Settings types — BrandSettings/ContactSettings/
                HomepageSettings/PoliciesSettings/PublicSettings
  domain.ts     AuthUser and other cross-cutting types
```

State management is intentionally mixed, not one framework:

- **Zustand** (`hooks/use-*-store.ts`) for client-only persisted state (cart,
  currency).
- **React Context** (`providers/settings-provider.tsx`,
  `theme-provider.tsx`) for app-wide config fetched once.
- **TanStack Query** for server-state fetching/mutation inside admin feature
  clients — follow the pattern already in `features/admin/categories/` or
  similar when adding a new admin screen, don't introduce a different data-
  fetching approach.

No Redux, no SWR.

## Conventions to follow when adding to this repo

- New admin domain → `features/admin/<domain>/` with `<domain>-client.tsx` +
  `types.ts` + `<domain>-actions.ts` + `index.ts` barrel, matching every
  existing domain. Don't put a client component flat in `features/admin/`.
- New backend-facing call → add the path to `services/api/endpoints.ts` first,
  then a thin method on the relevant `<domain>.service.ts`. Don't inline a
  raw `apiClient.get(...)` call inside a component.
- Any new field coming back from an endpoint that might be unset/legacy →
  normalize it in the service layer (see `content.service.ts`'s
  `normalizeBrand`/`normalizeContact`/etc.), not in the component. Components
  should be able to assume arrays are arrays and strings are strings.
- Image/file uploads go through real multipart endpoints
  (`FormData` + the documented endpoint) — never convert a file to a base64
  data URL and call that "uploaded." `AdminImageUploader`'s `onUpload` prop
  is the pattern to follow.
- Public pages read dynamic content via `useSiteSettings()` (client) or
  `contentService.getPublicSettings()` (server component) — never hardcode
  brand name, tagline, contact info, or hero copy.
- **Inline quick-edit popovers for admin table rows** (single-field-or-two
  edits that shouldn't require opening the full edit dialog — e.g. changing
  a product's status or price) follow the pattern in
  `features/admin/products/products-table.tsx`'s `InlineStatusChip` and
  `features/admin/products/pricing-popover.tsx`'s `PricingPopover`: a small
  trigger (chip or icon button) opens an MUI `Menu`/`Popover`, and on save
  it calls a **partial PATCH** to the same resource endpoint (e.g.
  `productService.updateProductStatus`/`updateProductPricing`, both PATCH
  `/admin/products/{id}` with just the changed field(s)) rather than the
  full update payload the edit dialog sends. Don't reach for
  react-hook-form/zod for these — plain local state is enough for 1-2
  fields; that machinery is reserved for the full multi-field edit forms.

## Build/verify commands

```
npx tsc --noEmit     # must be clean before calling anything done
npm run build        # full production build — catches server/client
                      # boundary issues tsc won't (missing "use client", etc.)
```

Run both after any non-trivial change. If a stray `next dev` process is
running from an earlier session, kill it before rebuilding — a concurrent
dev server writing to the same `.next` directory as a build produces
misleading `ENOENT`/`Cannot find module for page` errors that look like real
bugs but aren't:

```
pkill -9 -f "next dev"
```

If a build/runtime error mentions a missing chunk file (e.g. `Cannot find
module './1234.js'` from `.next/server/webpack-runtime.js`), that's a stale
`.next` build directory — usually left over from a `next dev`/`next build`
overlap, or from a file rename that shifted chunk IDs mid-session. Kill any
stray `next` process, then delete `.next` entirely and rebuild clean rather
than trying to debug the missing module:

```
pkill -9 -f "next dev"; rm -rf .next && npm run build
```

## Known gotchas already fixed (context for git blame, not TODOs)

- `services/content.ts` (a flat legacy wrapper) and `services/products.ts`
  used to duplicate the real `content.service.ts`/`product.service.ts` files
  under the matching subfolders. They're gone now — if you see an import of
  `@/services/content` or `@/services/products` (no subpath), that's stale
  and should be updated to `@/services/content/content.service` or
  `@/services/products/product.service`.
- **The app used to live in a `frontend/` subdirectory one level below the git
  root, with a duplicate (stale) copy of the app also sitting at the git root
  to satisfy Vercel's project config (`.vercel/repo.json` has
  `"directory": "."`).** Both are gone: the stale root duplicate was deleted,
  and `frontend/`'s contents were moved up into the git root, so the app root
  and the git root are now the same directory. If you see a reference to a
  `frontend/` path anywhere (docs, scripts, imports), that's stale — the
  repo root is the project root now. Husky and lint-staged config already
  lived at this root and are unaffected.
