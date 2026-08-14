# Zuriè API Contract

Version: 2.16 (Final — replaces v2.15)
Audience: Frontend team
Base URL: `https://api.zurie.co.tz/api/v1`
Auth: Laravel Sanctum, SPA cookie-based (not bearer token)

This document supersedes `zurie-backend-handoff-specification.md` and prior versions of `zurie-api-contract.md`. Where something here differs from those, **this is the source of truth**. Differences from v2.15 are called out under "Changes from v2.15" at the end.

---

## 1. Response Envelope

Every endpoint in the system follows exactly one of these four shapes. No exceptions.

**Single resource**

```json
{ "success": true, "data": { ... } }
```

**List / paginated**

```json
{
  "success": true,
  "data": [ ... ],
  "meta": { "count": 0, "page": 1, "pageSize": 20 }
}
```

**Action with no meaningful return body** (e.g. contact form submit, newsletter signup)

```json
{ "success": true }
```

**Error**

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": { "name": ["The name field is required."] }
}
```

`errors` is only present on 422 validation failures. Other errors return `success` + `message` only.

Status codes: `200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500`.

**Every `data` field is wrapped, with no bare-array or bare-object exceptions** — this includes `GET /faq` and `GET /settings/dashboard-overview`.

### 1.1 How to read the field tables in this document

Every request payload below (POST/PATCH/PUT bodies) is documented as a table: **Field**, **Rules**, **Description**. Read the Rules column literally — it's a direct translation of the backend's actual validation, not a paraphrase:

- **Required** — the field must be present in the request body, or the request fails with 422.
- **Optional** — you may omit the field entirely. Omitting it is not an error. If a type/format is listed (e.g. "Optional, string"), that constraint only applies when you _do_ send it.
- **Required if present** — only appears on PATCH endpoints (partial updates). You may omit the field entirely (leaves that value unchanged), but if you include it in the request, it can't be empty/null and must satisfy the listed constraint.
- Anywhere a max length, numeric range, allowed value list (`enum`), or uniqueness constraint is listed, that's enforced server-side — sending something outside it returns a 422 with a message under `errors.<field>`.

---

## 2. Authentication

Cookie-based session auth. No token is returned or stored client-side.

```
GET  /sanctum/csrf-cookie
POST /auth/login
GET  /auth/user
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
```

### 2.1 Required request setup — read before integrating

The API only treats a request as "stateful" (i.e. eligible for cookie-based session auth) if it comes from an origin the backend recognizes. Two things the frontend must do on **every** request, not just login:

1. **Send credentials.** Use `fetch(url, { credentials: 'include' })` or, with axios, set `axios.defaults.withCredentials = true`. Without this, the browser won't send or store the session/XSRF cookies at all.
2. **Call `GET /sanctum/csrf-cookie` once before the first state-changing request** (login, or any POST/PATCH/DELETE) in a session. This sets an `XSRF-TOKEN` cookie.

For the CSRF token itself:

- **If you're using axios**, you don't need to do anything else — axios automatically reads the `XSRF-TOKEN` cookie and attaches it as the `X-XSRF-TOKEN` header on every request.
- **If you're using `fetch` directly**, you must read the `XSRF-TOKEN` cookie yourself, **URL-decode it**, and set it as the `X-XSRF-TOKEN` header manually. Skipping the decode step is the most common cause of a `419 CSRF token mismatch` — the cookie is stored URL-encoded, the header must not be.

The backend's allowed origins (`SANCTUM_STATEFUL_DOMAINS` + CORS) currently include the production frontend domain and common local dev hosts (`localhost:3000`, `localhost:5173`, `127.0.0.1:8000`). If you're developing against a different host/port, ask backend to add it.

### 2.2 Flow

1. `GET /sanctum/csrf-cookie` — sets CSRF cookie
2. `POST /auth/login` — establishes session cookie
3. Every subsequent request relies on the cookie automatically (`credentials: include`)
4. `GET /auth/user` — call this on app load to restore session state, and again after any role/permission change

**POST /auth/login**

| Field      | Rules                        | Description      |
| ---------- | ---------------------------- | ---------------- |
| `email`    | Required, valid email format | Account email    |
| `password` | Required, string             | Account password |

```json
// Request
{ "email": "admin@zurie.local", "password": "admin12345" }

// Response 200
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "Local Admin", "email": "admin@zurie.local" },
    "roles": ["admin"],
    "permissions": ["product_create", "product_update", "order_update", "user_manage", "..."]
  }
}
```

**GET /auth/user** — same shape as login's `data`. Call this whenever you need to re-sync permissions (e.g. after a `PATCH /admin/users/{id}` role change succeeds).

`permissions` is a flat, de-duplicated array across all of the user's roles. Use it to show/hide UI — it is **not** a security boundary; the backend enforces every mutating action independently regardless of what the client thinks it can see.

**Full permission key catalog** (an account's `permissions` array is a subset of this list, depending on role):

```
user_manage
category_view, category_create, category_update, category_delete
product_view, product_create, product_update, product_delete
inventory_view, inventory_update
customer_view
order_view, order_update
media_view, media_upload, media_delete
faq_create, faq_update, faq_delete
enquiry_view, enquiry_update
dashboard_view
settings_manage
activity_view
```

**POST /auth/logout / forgot-password**

```json
{ "success": true }
```

### 2.3 Forgot / reset password

**POST /auth/forgot-password**

| Field   | Rules                        | Description                       |
| ------- | ---------------------------- | --------------------------------- |
| `email` | Required, valid email format | Address to send the reset link to |

```json
// Request
{ "email": "admin@zurie.local" }
// -> { "success": true }
```

Always returns success regardless of whether the email is registered (avoids leaking which addresses exist). If the email exists, the backend sends a reset link pointing at **the frontend's own page**, not a backend-hosted one:

```
{FRONTEND_URL}/reset-password?token={token}&email={email}
```

**The frontend must implement a `/reset-password` route/page** that reads `token` and `email` from the query string and submits them along with the new password to `POST /auth/reset-password`. This page doesn't exist on the backend — if it isn't built, users who request a password reset will hit a dead link.

**POST /auth/reset-password**

| Field                   | Rules                                                                  | Description                                                                      |
| ----------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `token`                 | Required, string                                                       | From the reset-link query string                                                 |
| `email`                 | Required, valid email format                                           | From the reset-link query string                                                 |
| `password`              | Required, string, min 8 characters, must match `password_confirmation` | New password                                                                     |
| `password_confirmation` | Required, must match `password`                                        | Confirmation field — Laravel's `confirmed` rule requires exactly this field name |

```json
// Request
{
  "token": "...", // from the query string
  "email": "admin@zurie.local",
  "password": "newPassword123",
  "password_confirmation": "newPassword123"
}
// -> { "success": true }
```

### 2.4 User & role management (admin) — previously undocumented, added in this revision

These endpoints exist and are implemented, but were missing from earlier versions of this document. All require `permission: user_manage`.

```
POST  /users                         — create an admin user
POST  /roles                         — create a role
POST  /users/{id}/roles              — attach a role to a user (additive, does not remove existing roles)
POST  /roles/{id}/permissions        — attach a permission to a role (additive)
GET   /admin/roles                   — list all roles, each with its permissions
GET   /admin/permissions             — list the full permission catalog
```

**`GET /admin/roles` and `GET /admin/permissions` are new as of this revision** — until now there was no way to list either, only create/assign endpoints, which left the frontend with nothing to populate a role/permission picker from. Both return a plain array under `data`, unpaginated (same shape `GET /faq` already uses) — the role/permission catalog is small and fixed-ish, not something that needs pages.

```json
// GET /admin/roles
{
  "success": true,
  "data": [
    { "id": 2, "name": "admin", "description": "Day-to-day store administration", "permissions": ["product_create", "product_update", "..."] }
  ]
}

// GET /admin/permissions
{
  "success": true,
  "data": [
    { "id": 7, "key": "product_create", "description": "Create products" }
  ]
}
```

`roles[].permissions` is an array of permission **keys** (strings), same format as the `permissions` array on the login/`GET /auth/user` response — not full permission objects. Use `GET /admin/permissions` if you need each permission's `id`/`description` too (e.g. to build the permission picker itself, since `POST /roles/{id}/permissions` takes a `permissionId`, not a key).

**POST /users**

| Field      | Rules                                        | Description      |
| ---------- | -------------------------------------------- | ---------------- |
| `name`     | Required, string, max 255                    | Display name     |
| `email`    | Required, valid email format, must be unique | Login email      |
| `password` | Required, string, min 8 characters           | Initial password |

```json
// Response 201 — same shape as any other user object
{ "success": true, "data": { "id": 5, "name": "...", "email": "..." } }
```

**POST /roles**

| Field         | Rules                                     | Description           |
| ------------- | ----------------------------------------- | --------------------- |
| `name`        | Required, string, max 255, must be unique | Role name             |
| `description` | Optional, string                          | Free-text description |

**POST /users/{id}/roles**

| Field    | Rules                                              | Description                 |
| -------- | -------------------------------------------------- | --------------------------- |
| `roleId` | Required, integer, must reference an existing role | Role to attach to this user |

This is additive (`syncWithoutDetaching`) — it adds the role without removing any the user already has. To set a user's full role list at once (replacing what's there), use `PATCH /admin/users/{id}` below instead.

**POST /roles/{id}/permissions**

| Field          | Rules                                                                                           | Description                       |
| -------------- | ----------------------------------------------------------------------------------------------- | --------------------------------- |
| `permissionId` | Required, integer, must reference an existing permission (see the permission key catalog above) | Permission to attach to this role |

Also additive, same reasoning as above.

---

## 3. Products & Categories

### Categories

```
GET    /categories                    (public — visible: true only)
GET    /admin/categories              (admin — all categories, including hidden)
GET    /categories/{id}               (public)
POST   /categories                    (admin)
PATCH  /categories/{id}               (admin)
DELETE /categories/{id}               (admin)
POST   /categories/{id}/image         multipart/form-data: image   (admin)
DELETE /categories/{id}/image                                      (admin)
```

`GET /categories` (public) only returns categories with `visible: true`. Use `GET /admin/categories` for a category management screen — same object shape, just unfiltered.

```json
// Category object
{
  "id": 2,
  "name": "Handbags",
  "slug": "handbags",
  "description": "...",
  "imageUrl": "https://...",
  "visible": true,
  "sortOrder": 1
}
```

**POST /categories** (create)

| Field         | Rules                                                 | Description                               |
| ------------- | ----------------------------------------------------- | ----------------------------------------- |
| `name`        | Required, string, max 255                             | Category name                             |
| `slug`        | Required, string, max 255, must be unique             | URL slug                                  |
| `description` | Optional, string                                      | Free-text description                     |
| `visible`     | Optional, boolean — defaults to `true` if omitted     | Whether it shows on the public storefront |
| `sortOrder`   | Optional, integer, min 0 — defaults to `0` if omitted | Display order, ascending                  |

**PATCH /categories/{id}** (partial update)

| Field         | Rules                                                                                            | Description                               |
| ------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| `name`        | Required if present, string, max 255                                                             | Category name                             |
| `slug`        | Required if present, string, max 255, must be unique (ignoring this category's own current slug) | URL slug                                  |
| `description` | Optional, string                                                                                 | Free-text description                     |
| `visible`     | Optional, boolean                                                                                | Whether it shows on the public storefront |
| `sortOrder`   | Optional, integer, min 0                                                                         | Display order, ascending                  |

**`imageUrl` is read-only in this object — not accepted on create or update at all**, as of v2.6. A category is created/edited with no image, then its image is set separately:

```
POST /categories/{id}/image   multipart/form-data
```

| Field   | Rules                                                                                               | Description              |
| ------- | --------------------------------------------------------------------------------------------------- | ------------------------ |
| `image` | Required, must be an actual image file, mime type one of `jpg/jpeg/png/webp/gif`, max 5MB (5120 KB) | The image file to upload |

This always **replaces** whatever image is currently set (a category only ever has one). Response is the full category object with the new `imageUrl`.

```
DELETE /categories/{id}/image
```

No request body. Clears the category's image (`imageUrl` becomes `null`). Response is the full category object.

Both endpoints return the same shape as any other category response:

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Handbags",
    "...": "...",
    "imageUrl": "https://..."
  }
}
```

### Products — public (storefront)

```
GET /products?category=&featured=&bestSeller=&newArrival=&page=&pageSize=
GET /products/{slug}
```

Public product objects **never** include `buyingPrice` — that field only appears in admin responses.

```json
// GET /products — list item
{
  "id": 10, "name": "Aurelia", "slug": "aurelia",
  "price": 220.0, "salePrice": 180.0,
  "featuredImageUrl": "https://...",
  "category": { "id": 2, "name": "Bags", "slug": "bags", "description": "...", "imageUrl": "https://...", "visible": true, "sortOrder": 0 },
  "stockStatus": "IN_STOCK"
}

// GET /products/{slug} — full detail
{
  "id": 10, "name": "Aurelia", "slug": "aurelia",
  "description": "...", "shortDescription": "...",
  "category": { "id": 2, "name": "Bags", "slug": "bags", "description": "...", "imageUrl": "https://...", "visible": true, "sortOrder": 0 },
  "price": 220.0, "salePrice": 180.0,
  "material": "Full-grain leather",
  "colors": [{ "name": "Noir", "hex": "#1f1f1f" }],
  "sizes": ["One Size"],
  "specifications": ["..."],
  "imageUrls": ["https://..."],
  "featured": true, "bestSeller": true, "newArrival": false,
  "stockStatus": "IN_STOCK",
  "seoTitle": "...", "seoDescription": "..."
}
```

**Pricing display rule**: if `salePrice` is present, show it as the active price with `price` struck through as the original. If `salePrice` is `null`, `price` is the only price to show.

`stockStatus` is served by the Product endpoint but is internally resolved from the separate Inventory module — now live: every product returns a real `IN_STOCK`/`LOW_STOCK`/`OUT_OF_STOCK` value (a product with no inventory activity yet defaults to `OUT_OF_STOCK`, not `null`).

**`category` (new, v2.9) is the full category object** (same shape as `GET /categories`/`GET /admin/categories`), not just an ID — present on both `GET /products` list items and `GET /products/{slug}` detail. **This is deliberately different from the admin product shape below**, which keeps `categoryId` only (see the note under "Products — admin").

### Products — admin

```
GET    /admin/products?status=&category=&featured=&bestSeller=&newArrival=&search=&page=&pageSize=
GET    /admin/products/{id}
POST   /products
PATCH  /products/{id}
DELETE /products/{id}          — hard delete, irreversible
POST   /products/{id}/duplicate
POST   /products/{id}/images            multipart/form-data: images[]
DELETE /products/{id}/images/{imageId}
```

`GET /admin/products` is a **separate endpoint from the public `GET /products`**, not the same list with an admin flag. Differences: not restricted to `status: published` (returns drafts and archived too — filter with `?status=` if you only want one), `search` matches name or SKU, and each list item is the **same full shape as `GET /admin/products/{id}`** (i.e. includes `buyingPrice`, `colors`, `sizes`, `imageUrls`, SEO fields, etc. — not a trimmed-down list shape like the public `GET /products`).

**Admin product responses return `categoryId` only — never a nested `category` object**, unlike the public product responses above. If you need the category's name/image/etc. alongside an admin product list or detail view, fetch it separately via `GET /admin/categories` and join client-side; this is a deliberate difference, not an oversight.

```json
// Create payload — "quantity" is optional and create-only, see note below
{
  "name": "Aurelia", "slug": "aurelia",
  "description": "...", "shortDescription": "...",
  "categoryId": 2, "sku": "AUR-001",
  "buyingPrice": 140.0, "price": 220.0, "salePrice": 180.0,
  "material": "...", "status": "published",
  "featured": true, "bestSeller": true, "newArrival": false,
  "colors": [{ "name": "Noir", "hex": "#1f1f1f" }],
  "sizes": ["One Size"],
  "specifications": ["..."],
  "seoTitle": "...", "seoDescription": "...",
  "quantity": 25
}

// Response
{ "success": true, "data": { "id": 10 } }
```

**⚠️ Only `categoryId`, `buyingPrice`, `price`, `name`, and `slug` are actually required to create a product. Every other field in the example above — including `specifications`, `colors`, `sizes`, `description`, `sku`, `material`, `status`, `seoTitle`, `seoDescription`, and `quantity` — is optional and can be left out of the request entirely.** The example JSON shows what a _fully filled-in_ product looks like, not what's mandatory. Use the table below, not the example, to decide what you must send.

**POST /products** (create)

| Field              | Rules                                                                                                                                                                   | Description                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `name`             | Required, string, max 255                                                                                                                                               | Product name                                                            |
| `slug`             | Required, string, max 255, must be unique                                                                                                                               | URL slug                                                                |
| `categoryId`       | Required, integer, must reference an existing category                                                                                                                  | Category this product belongs to                                        |
| `buyingPrice`      | Required, numeric, >= 0                                                                                                                                                 | Internal cost (admin-only, never shown publicly)                        |
| `price`            | Required, numeric, >= 0                                                                                                                                                 | Listed price                                                            |
| `description`      | **Optional**, string                                                                                                                                                    | Long-form description                                                   |
| `shortDescription` | **Optional**, string, max 500                                                                                                                                           | Short summary, e.g. for listing cards                                   |
| `sku`              | **Optional**, string, max 100, must be unique if provided                                                                                                               | Stock-keeping unit code                                                 |
| `salePrice`        | **Optional**, numeric, >= 0, must be <= `price` if provided                                                                                                             | Discounted price; omit if not on sale                                   |
| `material`         | **Optional**, string, max 255                                                                                                                                           | Material description                                                    |
| `status`           | **Optional**, one of `draft`, `published`, `archived` — defaults to `draft` if omitted                                                                                  | Content visibility state                                                |
| `featured`         | **Optional**, boolean — defaults to `false` if omitted                                                                                                                  | Show in "featured" sections                                             |
| `bestSeller`       | **Optional**, boolean — defaults to `false` if omitted                                                                                                                  | Show in "best seller" sections                                          |
| `newArrival`       | **Optional**, boolean — defaults to `false` if omitted                                                                                                                  | Show in "new arrival" sections                                          |
| `colors`           | **Optional**, array — omit entirely if the product has no color variants                                                                                                | List of `{ name, hex }` objects                                         |
| `colors[].name`    | Required only if `colors` is sent, string, max 100                                                                                                                      | Color name, e.g. `"Noir"`                                               |
| `colors[].hex`     | Required only if `colors` is sent, string, max 7                                                                                                                        | Hex code, e.g. `"#1f1f1f"`                                              |
| `sizes`            | **Optional**, array of strings — omit entirely if the product has no size variants                                                                                      | e.g. `["S", "M", "L"]`                                                  |
| `specifications`   | **Optional**, array of strings — this is the field that was reported as causing a validation error; it is not required, omit it or send `[]` if there's nothing to list | Free-text bullet points, e.g. `["Full-grain leather", "Hand-stitched"]` |
| `seoTitle`         | **Optional**, string, max 255                                                                                                                                           | `<title>` override                                                      |
| `seoDescription`   | **Optional**, string                                                                                                                                                    | Meta description override                                               |
| `quantity`         | **Optional**, integer, >= 0, **create-only** — not accepted on `PATCH`                                                                                                  | Sets initial Inventory stock in the same request                        |

**PATCH /products/{id}** (partial update — send only the fields you're changing)

| Field                                    | Rules                                                                                                                                                 | Description                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `name`                                   | Required if present, string, max 255                                                                                                                  | —                                    |
| `slug`                                   | Required if present, string, max 255, must be unique (ignoring this product's own current slug)                                                       | —                                    |
| `categoryId`                             | Required if present, integer, must reference an existing category                                                                                     | —                                    |
| `buyingPrice`                            | Required if present, numeric, >= 0                                                                                                                    | —                                    |
| `price`                                  | Required if present, numeric, >= 0                                                                                                                    | —                                    |
| `description`                            | Optional, string                                                                                                                                      | —                                    |
| `shortDescription`                       | Optional, string, max 500                                                                                                                             | —                                    |
| `sku`                                    | Optional, string, max 100, must be unique if provided (ignoring this product's own current SKU)                                                       | —                                    |
| `salePrice`                              | Optional, numeric, >= 0, must be <= the effective `price` (the one in this request if you're also changing it, otherwise the product's current price) | —                                    |
| `material`                               | Optional, string, max 255                                                                                                                             | —                                    |
| `status`                                 | Optional, one of `draft`, `published`, `archived`                                                                                                     | —                                    |
| `featured` / `bestSeller` / `newArrival` | Optional, boolean                                                                                                                                     | —                                    |
| `colors`                                 | Optional, array — **if sent, replaces the product's entire color list**, it's not merged/appended                                                     | Same `{ name, hex }` shape as create |
| `sizes`                                  | Optional, array of strings — **if sent, replaces the entire size list**                                                                               | —                                    |
| `specifications`                         | Optional, array of strings — **if sent, replaces the entire list**                                                                                    | —                                    |
| `seoTitle`                               | Optional, string, max 255                                                                                                                             | —                                    |
| `seoDescription`                         | Optional, string                                                                                                                                      | —                                    |

`quantity` is **not** accepted here — once a product exists, stock is only changed via `PATCH /products/{id}/inventory` (below). `imageUrls`/images are also not accepted here — see "Product images" below.

**Response**: the full updated admin product object (same shape as `GET /admin/products/{id}`), wrapped in `data` — not an empty acknowledgment.

`GET /admin/products/{id}` returns almost everything the public detail returns, plus `buyingPrice` and `quantity` (raw Inventory stock count — admin-only, alongside the already-public `stockStatus`) — **with one exception: `category` is `categoryId` here instead of the nested object** the public endpoints return (see the note under "Products — admin" above). `GET /admin/products` list items include `quantity` too, same as every other field on that list (full admin shape, see above).

### Product images — no longer a JSON field, as of v2.6

**`imageUrls` is no longer accepted on `POST /products` or `PATCH /products/{id}`.** A product is created/edited with no images at all, then images are uploaded directly to it:

```
POST /products/{id}/images   multipart/form-data
```

| Field      | Rules                                                                                                                                 | Description                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `images[]` | Required, array with at least 1 file. Each file: must be an actual image, mime type one of `jpg/jpeg/png/webp/gif`, max 5MB (5120 KB) | One or more image files — send multiple in one request rather than calling this once per file |

Appends to the product's existing images (does not replace them) — new images are added after whatever's already there. Response is the full admin product object (same shape as `GET /admin/products/{id}`), including the updated `imageUrls`.

```
DELETE /products/{id}/images/{imageId}
```

No request body. Removes one image by its ID. Response is the full admin product object.

**Getting image IDs**: `imageUrls` (the plain array of URL strings) is unchanged everywhere it already existed — public product responses still only ever return strings, they have no delete capability so there's nothing to key off. **`GET /admin/products/{id}` and `GET /admin/products` list items now additionally include an `images` field** for this purpose:

```json
"images": [
  { "id": 5, "url": "https://.../a.jpg", "sortOrder": 0 },
  { "id": 6, "url": "https://.../b.jpg", "sortOrder": 1 }
]
```

Use `images[].id` as `{imageId}` when calling the delete endpoint above. `imageUrls` and `images` carry the same underlying data, just shaped differently — `imageUrls` for anything that only needs to render, `images` for anything that needs to manage (delete) individual images.

### Inventory (admin only, separate from product endpoints)

```
GET   /products/{id}/inventory
PATCH /products/{id}/inventory
```

**PATCH /products/{id}/inventory**

| Field         | Rules                                                                                                            | Description              |
| ------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `quantity`    | Optional, but required (non-empty) if you include the key at all, integer, >= 0                                  | New stock quantity       |
| `stockStatus` | Optional, but required (non-empty) if you include the key at all, one of `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK` | Explicit status override |

You may send either field alone, both together, or (rarely useful) neither. See the auto-derivation note below for what happens when only `quantity` is sent.

```json
// PATCH request — either or both fields
{ "quantity": 40, "stockStatus": "IN_STOCK" }

// Response
{ "success": true, "data": { "productId": 10, "quantity": 40, "stockStatus": "IN_STOCK" } }
```

`stockStatus` auto-derives from `quantity` alone whenever `quantity` is sent without an explicit `stockStatus` in the same request: `0` → `OUT_OF_STOCK`, anything positive → `IN_STOCK`. Sending `stockStatus` explicitly always overrides the derived value regardless of quantity — e.g. a product can be manually set `OUT_OF_STOCK` while quantity is still positive (quality hold, discontinued, etc.), or manually set `LOW_STOCK`, which is never auto-assigned (no quantity threshold is defined for it).

**Product `status` vs inventory `stockStatus` — do not confuse these two fields.** `status` (`draft | published | archived`) is about whether the product exists/is visible on the site. `stockStatus` (`IN_STOCK | LOW_STOCK | OUT_OF_STOCK`) is entirely independent — a `published` product can be `OUT_OF_STOCK`.

---

## 4. Orders

```
POST  /orders                          (public — checkout)
GET   /admin/orders                    (admin)  ?page=&pageSize=&search=&status=
GET   /admin/orders/{orderNumber}      (admin)
PATCH /admin/orders/{orderNumber}      (admin)
POST  /admin/orders/{orderNumber}/cancel  (admin)
```

Admin routes use the `admin/` prefix — the new standard as of v2.11, applied unconditionally to every admin route going forward (see "Changes from v2.10" below).

**The `{orderNumber}` route segment is the `orderNumber` field from the order object (e.g. `ORD-000123`), not the numeric `id`.** `id` is still present in responses but is never used for routing, error messages, or anything else user-facing — build order detail/status/cancel links around `orderNumber`.

**Cancellation is its own endpoint, not part of the generic `PATCH` above — `status: cancelled` is not accepted by `PATCH /admin/orders/{orderNumber}` at all** (fails validation, `422`). Cancelling an order restocks inventory for every line item, a side effect the generic status update deliberately doesn't carry. **Do not show "Cancelled" as an option in whatever UI sets `status` via the generic update** — wire it to a separate "Cancel order" action that calls `POST /admin/orders/{orderNumber}/cancel` instead.

**Checkout — send only IDs and quantities. No prices, no product names.**

```json
// POST /orders
{
  "customerName": "Jane Doe",
  "customerPhone": "+255...",
  "whatsappNumber": "+255...",
  "customerEmail": null,
  "items": [{ "productId": 10, "quantity": 2 }]
}
```

The backend looks up each `productId`, pulls the _current_ price server-side, and computes the total. **Do not send a `total` field — if sent, it is ignored entirely.**

```json
// Response 201
{
  "success": true,
  "data": {
    "id": 100,
    "orderNumber": "ORD-000100",
    "status": "new",
    "customerName": "Jane Doe",
    "customerPhone": "+255...",
    "whatsappNumber": "+255...",
    "customerEmail": null,
    "totalAmount": 440.0,
    "notes": null,
    "items": [
      {
        "productId": 10,
        "productName": "Aurelia",
        "quantity": 2,
        "unitSellingPrice": 220.0,
        "lineTotal": 440.0
      }
    ],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**This same full shape (including `orderNumber`/`customerPhone`/`whatsappNumber`/`customerEmail`/`notes`/`createdAt`/`updatedAt`) is also what `GET /admin/orders/{orderNumber}` and `PATCH /admin/orders/{orderNumber}` return** — not just the trimmed `id`/`orderNumber`/`status`/`customerName`/`totalAmount`/`items` subset. Line items never include a buying-price/cost field, even in the admin-only detail view — same "don't expose cost" treatment `buyingPrice` gets elsewhere, applied here because this response shape is shared with the public checkout endpoint above.

**If checkout fails because requested quantity exceeds available stock**, the response is a `422`: `{ "success": false, "message": "Insufficient stock for product #10: requested 5, only 2 available." }`. This can happen even for a quantity that _was_ available moments earlier — two customers checking out the same low-stock item at nearly the same time is the expected case this guards against, not a bug.

**GET /admin/orders — list**

```json
{
  "success": true,
  "data": [
    {
      "id": 100,
      "orderNumber": "ORD-000100",
      "status": "new",
      "customerName": "Jane Doe",
      "totalAmount": 440.0,
      "createdAt": "..."
    }
  ],
  "meta": { "count": 1, "page": 1, "pageSize": 10 }
}
```

List items stay trimmed to exactly this shape — no `items`/`customerPhone`/etc. Fetch `GET /admin/orders/{orderNumber}` for the full object. `search` now also matches `orderNumber`, alongside customer name/phone.

**PATCH /admin/orders/{orderNumber}**

```json
{ "status": "confirmed", "notes": "Optional admin note" }
```

Only `status` and/or `notes` are ever accepted here — send just the one you're changing. Valid `status` values: `new`, `confirmed`, `processing`, `ready_for_delivery`, `delivered` — **not `cancelled`**, see above. Response is the full updated order object, same shape as the checkout response above.

**Status changes are strictly forward, one step at a time — `new` → `confirmed` → `processing` → `ready_for_delivery` → `delivered`.** Skipping a stage (e.g. `new` straight to `ready_for_delivery`), moving backward (e.g. `processing` back to `confirmed`), or re-sending the order's current status all fail with a `422`:

```json
{
  "success": false,
  "message": "Order ORD-000100 cannot move from 'new' to 'ready_for_delivery'. The only allowed next status is 'confirmed'."
}
```

**Build the status-change UI around this** — offer only the single valid next status as the option, not a free-choice dropdown of all five, and confirm with the user before submitting (a status change here can't be undone by sending the old value back — see terminal states below).

**`cancelled` and `delivered` are both terminal states.** Once an order reaches either, `PATCH /admin/orders/{orderNumber}` rejects any further `status` change on it (`422`) — notes can still be edited on either, but the order's status is locked for good.

**POST /admin/orders/{orderNumber}/cancel**

No request body. Response is the full updated order object (same shape as above), with `status: "cancelled"`.

Only callable while the order's current status is `new`, `confirmed`, `processing`, or `ready_for_delivery`. Calling it on a `delivered` order, or an order that's already `cancelled`, returns a `422`:

```json
{
  "success": false,
  "message": "Order ORD-000100 cannot be cancelled from its current status (delivered)."
}
```

There is no `DELETE /orders/{orderNumber}`. Orders are never removed — to cancel one, call the dedicated cancel endpoint above (not a generic status `PATCH`).

---

## 5. Contact, FAQ, Newsletter

**FAQ**

```
GET    /faq                            (public)
POST   /admin/faq                      (admin)
PATCH  /admin/faq/{id}                 (admin)
DELETE /admin/faq/{id}                 (admin)
```

```json
{
  "success": true,
  "data": [{ "id": 1, "question": "...", "answer": "...", "sortOrder": 1 }]
}
```

**Contact**

```
POST  /contact                         (public)
GET   /admin/enquiries                 (admin)  ?page=&pageSize=&search=&status=
PATCH /admin/enquiries/{id}            (admin)
```

```json
// POST /contact
{ "name": "Customer", "email": "customer@email.com", "message": "..." }
// -> { "success": true }

// PATCH /admin/enquiries/{id}
{ "status": "responded" }
```

There is no reply/thread mechanism — admin responds outside the system using the captured contact info.

**Newsletter**

```
POST /newsletter                       (public)
```

```json
{ "email": "customer@email.com" }
// -> { "success": true }
```

There is currently no unsubscribe endpoint. Flag to the client — likely needed for compliance depending on jurisdiction.

---

## 6. Media

```
POST   /media/upload                   multipart/form-data: file, folder
GET    /media                          (admin)  ?page=&pageSize=&search=
DELETE /media/{id}                     (admin)
```

**POST /media/upload**

| Field    | Rules                                                                                               | Description                                                         |
| -------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `file`   | Required, must be an actual image file, mime type one of `jpg/jpeg/png/webp/gif`, max 5MB (5120 KB) | The file to upload                                                  |
| `folder` | Required, string, max 100                                                                           | Logical folder/namespace to store it under, e.g. `"brand"`, `"faq"` |

```json
// POST /media/upload response
{
  "success": true,
  "data": {
    "id": 12,
    "url": "https://.../uploaded-file.jpg",
    "folder": "brand",
    "originalFilename": "logo.png",
    "mimeType": "image/png",
    "size": 48213,
    "uploadedBy": 1,
    "createdAt": "..."
  }
}
```

Deleting a media item has **no protection against it still being referenced** by a product's `imageUrls`. If that happens, the image URL on the product will 404. The frontend should have a fallback/placeholder image on load error (`onError` handler) — this is intentionally a frontend concern, not something the backend guards against.

**This section is for the standalone media library only.** As of v2.6, product and category images no longer need to go through `POST /media/upload` first — see §3's "Product images" and "Categories" sections for the direct `POST /products/{id}/images` / `POST /categories/{id}/image` endpoints, which upload and attach in one call. `POST /media/upload` is still there for anything that needs a general-purpose upload independent of a specific product/category (e.g. a future media-library picker), but it's no longer part of the product/category creation flow.

---

## 7. Dashboard

```
GET /admin/dashboard-overview          (admin, permission: dashboard_view)
```

Not nested under `/settings/` — moved as of v2.11 (was previously drafted at `/settings/dashboard-overview`); Dashboard is its own module, not part of Settings.

**First slice, implemented as of v2.16** — 5 stats. Flat object, no nested lists yet:

```json
{
  "success": true,
  "data": {
    "totalProducts": 128,
    "productsInStock": 110,
    "productsOutOfStock": 18,
    "totalCategories": 12,
    "newOrders": 4
  }
}
```

More stats (order breakdowns by status, enquiry counts, low-stock/recent-activity lists, etc.) will be added as their owning data becomes available — expect new fields added to this object over time, not a reshape.

---

## 8. Settings

```
GET /admin/settings/brand-content      PUT /admin/settings/brand-content
GET /admin/settings/contact-info       PUT /admin/settings/contact-info
GET /admin/settings/homepage           PUT /admin/settings/homepage
```

All return/accept `{ "success": true, "data": { ... } }`. Shape of `data` is a free-form key/value object per setting domain (backend stores these as flexible JSON, so exact fields may grow over time without a breaking change).

---

## 9. Admin Users

```
GET   /admin/users                     ?page=&pageSize=
PATCH /admin/users/{id}
```

**PATCH /admin/users/{id}**

| Field     | Rules                                                                                             | Description                     |
| --------- | ------------------------------------------------------------------------------------------------- | ------------------------------- |
| `roleIds` | Required, array with at least 1 entry, each value must be an integer referencing an existing role | The user's _complete_ role list |

Unlike `POST /users/{id}/roles` (§2.4), this **replaces** the user's roles entirely with the array sent — it's a full sync, not additive. Send every role the user should end up with, not just the ones you're adding.

```json
// PATCH request — a user can hold multiple roles
{ "roleIds": [2, 5] }
```

---

## 10. Activity Log

```
GET /admin/activity                    (admin)  ?page=&pageSize=
```

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "action": "product.updated",
      "subjectType": "Product",
      "subjectId": 10,
      "createdAt": "..."
    }
  ],
  "meta": { "count": 1 }
}
```

---

## Enums

```
role:              super_admin | admin | staff   (a user may hold more than one)
order.status:      new | confirmed | processing | ready_for_delivery | delivered | cancelled
enquiry.status:     new | read | responded | archived
product.status:     draft | published | archived
inventory.stockStatus: IN_STOCK | LOW_STOCK | OUT_OF_STOCK
```
