# Zuriè API Contract

Version: 2.24 (Final — replaces v2.23)
Audience: Frontend team
Base URL: `https://api.zurie.co.tz/api/v1`
Auth: Laravel Sanctum, SPA cookie-based (not bearer token)

This document supersedes `zurie-backend-handoff-specification.md` and prior versions of `zurie-api-contract.md`. Where something here differs from those, **this is the source of truth**. Differences from v2.23 are called out under "Changes from v2.23" at the end.

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
PATCH /admin/roles/{id}              — replace a role's full permission set
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

**PATCH /admin/roles/{id}** — new as of v2.20

| Field           | Rules                                                                                                                                                                                           | Description                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `permissionIds` | Must be present in the payload (key can't be omitted), array, **empty array is valid** — send `[]` to revoke every permission. Each value must be an integer referencing an existing permission | Full replacement permission set for this role |

Full replace, not additive — unlike `POST /roles/{id}/permissions`, this **removes** any permission not in the array. An empty array is valid and revokes every permission from the role; this is the only endpoint that can do that. Same pattern as `PATCH /admin/users/{id}` for a user's roles.

```json
// Request
{ "permissionIds": [3, 7, 12] }

// Response — full role object, same shape as GET /admin/roles items
{ "success": true, "data": { "id": 2, "name": "staff", "description": "...", "permissions": ["product_view", "order_view", "..."] } }
```

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
      "customerPhone": "+255...",
      "whatsappNumber": "+255...",
      "totalAmount": 440.0,
      "createdAt": "..."
    }
  ],
  "meta": { "count": 1, "page": 1, "pageSize": 10 }
}
```

List items include `customerPhone`/`whatsappNumber` (an admin scanning the table needs a quick way to contact the customer) but stay trimmed otherwise — no `items`/`customerEmail`/`notes`/`updatedAt`. Fetch `GET /admin/orders/{orderNumber}` for the full object. `search` now also matches `orderNumber`, alongside customer name/phone.

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

**As of v2.17** — 5 scalar stats + 3 "recent" lists (latest 5 each):

```json
{
  "success": true,
  "data": {
    "totalProducts": 128,
    "productsInStock": 110,
    "productsOutOfStock": 18,
    "totalCategories": 12,
    "newOrders": 4,
    "recentOrders": [/* same item shape as GET /admin/orders — see §4 */],
    "recentProducts": [/* same item shape as GET /admin/products — see §3 */],
    "recentCustomers": [
      /* same item shape as GET /admin/customers — see §5/§6 wherever Customer is documented */
    ]
  }
}
```

Each `recent*` list is formatted with the **exact same row shape** as that entity's own admin list endpoint — `recentOrders` items look identical to `GET /admin/orders`' items, `recentProducts` to `GET /admin/products`', `recentCustomers` to `GET /admin/customers`'. No separate dashboard-only shape to learn — reuse the same row-rendering component you already have for each list page.

More stats (order breakdowns by status, enquiry counts, low-stock lists, etc.) will be added as their owning data becomes available — expect new fields added to this object over time, not a reshape.

---

## 8. Settings — implemented as of v2.22

```
GET  /settings                              (public)

GET  /admin/settings/brand                  PUT /admin/settings/brand
POST /admin/settings/brand/logo             multipart: image

GET  /admin/settings/contact                PUT /admin/settings/contact

GET  /admin/settings/homepage               PUT /admin/settings/homepage
POST /admin/settings/homepage/hero-image    multipart: image

GET  /admin/settings/policies               PUT /admin/settings/policies
```

All admin endpoints require `permission: settings_manage`. All return/accept `{ "success": true, "data": { ... } }`.

**There is no `POST` (create) or `DELETE` for any settings category, and this is intentional, not a gap:**

- **`PUT` is both create and update.** The first `PUT /admin/settings/{category}` you ever send creates that category's stored row; every one after that updates it. There's nothing meaningfully different between the two from your side — always just `PUT` the full desired payload for that category.
- **A category itself is never deleted.** It doesn't make sense for "the contact settings" to not exist at all — the site always has _a_ brand config, _a_ contact config, even if every field in it is empty. To clear a category, `PUT` it with empty/null values (e.g. `{ "phones": [], "emails": [], "socialLinks": [] }`), don't look for a delete endpoint.
- **Array fields (`phones`, `emails`, `socialLinks`) are full-replace, not individually addressable.** There's no `POST .../phones` to add one entry or `DELETE .../phones/{id}` to remove one. To remove a single phone number: take the current array from `GET`, drop the one entry client-side, and `PUT` the whole array back without it. This is the same pattern Product's `colors`/`sizes` already use — full array replace on every write, no per-item CRUD — not something new invented for Settings.

**GET /settings (public)** — one call, everything the homepage needs:

```json
{
  "success": true,
  "data": {
    "brand": {
      "siteName": "Zuriè",
      "tagline": "Handcrafted leather goods",
      "logoUrl": "https://.../logo.png"
    },
    "contact": {
      "phones": [
        { "label": "Sales", "value": "+255700000000" },
        { "label": "WhatsApp Orders", "value": "+255700000001" }
      ],
      "emails": [{ "label": "Support", "value": "support@zurie.co.tz" }],
      "socialLinks": [
        { "platform": "instagram", "url": "https://instagram.com/zurie" }
      ]
    },
    "homepage": {
      "heroHeading": "...",
      "heroSubheading": "...",
      "heroCtaText": "Shop now",
      "heroCtaUrl": "/products",
      "heroImageUrl": "https://.../hero.jpg"
    },
    "policies": { "deliveryPolicy": "...", "returnPolicy": "..." }
  }
}
```

Any category with nothing saved yet resolves to `{}` (brand/homepage/policies) or empty arrays (contact) rather than a missing key or a 404 — safe to render defensively either way.

**`phones`/`emails` labels are free text**, not a fixed set — the admin can label an entry anything ("Sales", "WhatsApp Orders", "Nairobi Branch").

---

**GET /admin/settings/brand** — returns the object below directly (not wrapped in a `brand` key).

**PUT /admin/settings/brand**

| Field      | Rules                     | Description                           |
| ---------- | ------------------------- | ------------------------------------- |
| `siteName` | Required, string, max 255 | Site name shown in header/browser tab |
| `tagline`  | Optional, string, max 255 | Short slogan under the site name      |

`logoUrl` is **not** a field here — it's read-only on this endpoint (set via the upload endpoint below) and any `logoUrl` sent in this payload is silently ignored, not saved.

```json
// PUT /admin/settings/brand — flat payload, no "brand" wrapper key
{
  "siteName": "Zuriè",
  "tagline": "Handcrafted leather goods"
}

// Response — includes logoUrl even though this request didn't set it
{
  "success": true,
  "data": { "siteName": "Zuriè", "tagline": "Handcrafted leather goods", "logoUrl": "https://.../logo.png" }
}
```

**POST /admin/settings/brand/logo** — `multipart/form-data`, not JSON.

| Field   | Rules                                                                 | Description   |
| ------- | --------------------------------------------------------------------- | ------------- |
| `image` | Required, file, image, mimes: jpg/jpeg/png/webp/svg, max 2MB (2048KB) | The logo file |

Replaces whatever logo is currently set — there's no separate delete, upload a new one to change it.

```json
// Response — full brand object, with the new logoUrl
{
  "success": true,
  "data": {
    "siteName": "Zuriè",
    "tagline": "Handcrafted leather goods",
    "logoUrl": "https://.../logo-new-uuid.png"
  }
}
```

---

**GET /admin/settings/contact** — returns the object below directly (not wrapped in a `contact` key).

**PUT /admin/settings/contact**

| Field                    | Rules                                                                                                                 | Description                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `phones`                 | **Must be present in the request body** (send `[]` if empty — omitting the key entirely is a validation error), array | Full replacement list of phone entries                                |
| `phones[].label`         | Required, string, max 100                                                                                             | Free text — any label ("Sales", "WhatsApp Orders", "Nairobi Branch")  |
| `phones[].value`         | Required, string, max 50                                                                                              | The phone number itself                                               |
| `emails`                 | **Must be present**, array                                                                                            | Full replacement list of email entries                                |
| `emails[].label`         | Required, string, max 100                                                                                             | Free text label                                                       |
| `emails[].value`         | Required, valid email format, max 255                                                                                 | The email address                                                     |
| `socialLinks`            | **Must be present**, array                                                                                            | Full replacement list of social links                                 |
| `socialLinks[].platform` | Required, string, max 100                                                                                             | e.g. `"instagram"`, `"facebook"`, `"tiktok"` — free text, not an enum |
| `socialLinks[].url`      | Required, valid URL format, max 500                                                                                   | Link to the profile/page                                              |

**All three keys are required in every request, even if you're only changing one of them** — this endpoint is a full replace of the whole contact category, not a per-field patch. If you only want to update `phones`, you must still send the current `emails` and `socialLinks` arrays back unchanged (fetch them from `GET /admin/settings/contact` first if you don't already have them client-side). Sending `[]` for any of the three clears that list; omitting a key entirely is a `422` validation error, not treated as "leave unchanged."

```json
// PUT /admin/settings/contact — flat payload, no "contact" wrapper key
{
  "phones": [
    { "label": "Sales", "value": "+255700000000" },
    { "label": "WhatsApp Orders", "value": "+255700000001" }
  ],
  "emails": [
    { "label": "Support", "value": "support@zurie.co.tz" }
  ],
  "socialLinks": [
    { "platform": "instagram", "url": "https://instagram.com/zurie" }
  ]
}

// Response — the same shape, echoed back as saved
{
  "success": true,
  "data": {
    "phones": [
      { "label": "Sales", "value": "+255700000000" },
      { "label": "WhatsApp Orders", "value": "+255700000001" }
    ],
    "emails": [{ "label": "Support", "value": "support@zurie.co.tz" }],
    "socialLinks": [{ "platform": "instagram", "url": "https://instagram.com/zurie" }]
  }
}
```

To clear every phone number while leaving emails/social links alone:

```json
// PUT /admin/settings/contact
{
  "phones": [],
  "emails": [{ "label": "Support", "value": "support@zurie.co.tz" }],
  "socialLinks": [
    { "platform": "instagram", "url": "https://instagram.com/zurie" }
  ]
}
```

---

**GET /admin/settings/homepage** — returns the object below directly (not wrapped in a `homepage` key).

**PUT /admin/settings/homepage**

| Field            | Rules                               | Description                       |
| ---------------- | ----------------------------------- | --------------------------------- |
| `heroHeading`    | Required, string, max 255           | Main hero banner heading          |
| `heroSubheading` | Optional, string, max 500           | Supporting text under the heading |
| `heroCtaText`    | Optional, string, max 100           | Call-to-action button label       |
| `heroCtaUrl`     | Optional, valid URL format, max 500 | Where the CTA button links to     |

`heroImageUrl` is **not** a field here — same as `logoUrl` on brand, it's read-only on this endpoint and set only via the upload endpoint below.

```json
// PUT /admin/settings/homepage — flat payload, no "homepage" wrapper key
{
  "heroHeading": "Crafted to last",
  "heroSubheading": "Premium leather goods, made by hand",
  "heroCtaText": "Shop now",
  "heroCtaUrl": "/products"
}

// Response — includes heroImageUrl even though this request didn't set it
{
  "success": true,
  "data": {
    "heroHeading": "Crafted to last",
    "heroSubheading": "Premium leather goods, made by hand",
    "heroCtaText": "Shop now",
    "heroCtaUrl": "/products",
    "heroImageUrl": "https://.../hero.jpg"
  }
}
```

**POST /admin/settings/homepage/hero-image** — `multipart/form-data`, not JSON.

| Field   | Rules                                                             | Description           |
| ------- | ----------------------------------------------------------------- | --------------------- |
| `image` | Required, file, image, mimes: jpg/jpeg/png/webp, max 5MB (5120KB) | The hero banner image |

Replaces whatever hero image is currently set.

```json
// Response — full homepage object, with the new heroImageUrl
{
  "success": true,
  "data": {
    "heroHeading": "Crafted to last",
    "heroSubheading": "Premium leather goods, made by hand",
    "heroCtaText": "Shop now",
    "heroCtaUrl": "/products",
    "heroImageUrl": "https://.../hero-new-uuid.jpg"
  }
}
```

---

**GET /admin/settings/policies** — returns the object below directly (not wrapped in a `policies` key).

**PUT /admin/settings/policies**

| Field            | Rules            | Description                             |
| ---------------- | ---------------- | --------------------------------------- |
| `deliveryPolicy` | Optional, string | Free-text delivery areas/cost/timelines |
| `returnPolicy`   | Optional, string | Free-text return/refund policy          |

```json
// PUT /admin/settings/policies — flat payload, no "policies" wrapper key
{
  "deliveryPolicy": "We deliver within Dar es Salaam in 1-2 business days. Upcountry delivery takes 3-5 business days.",
  "returnPolicy": "Returns accepted within 7 days of delivery, provided the item is unused and in its original packaging."
}

// Response
{
  "success": true,
  "data": {
    "deliveryPolicy": "We deliver within Dar es Salaam in 1-2 business days. Upcountry delivery takes 3-5 business days.",
    "returnPolicy": "Returns accepted within 7 days of delivery, provided the item is unused and in its original packaging."
  }
}
```

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
GET /admin/activity                    (admin, permission: activity_view)  ?page=&pageSize=
```

**As of v2.19** — built on `spatie/laravel-activitylog`, replacing the earlier placeholder shape shown in prior versions of this doc (`userId`/`action` are gone):

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "logName": "product",
      "event": "updated",
      "description": "Product 'Aurelia Tote' updated",
      "subjectType": "Product",
      "subjectId": 10,
      "causerId": 3,
      "causerName": "Jane Admin",
      "createdAt": "..."
    }
  ],
  "meta": { "count": 1, "page": 1, "pageSize": 20 }
}
```

`causerId`/`causerName` are `null` for guest-triggered entries (a customer's checkout) and failed login attempts — don't assume a causer always exists. `description` is intentionally short (e.g. `"Guest checkout — Order ORD-000123 placed"`, `"Order ORD-000123 status changed to 'confirmed'"`) — enough to identify what happened without opening anything else. `logName` is a coarse channel (`auth`, `product`, `category`, `order`, `inventory`) if you want to filter by area client-side; there's no `?logName=` filter param on this endpoint yet.

---

## Enums

```
role:              super_admin | admin | staff   (a user may hold more than one)
order.status:      new | confirmed | processing | ready_for_delivery | delivered | cancelled
enquiry.status:     new | read | responded | archived
product.status:     draft | published | archived
inventory.stockStatus: IN_STOCK | LOW_STOCK | OUT_OF_STOCK
```

---

## Changes from v2.23 — read before integrating

1. **§8 (Settings) rewritten with explicit request/response payloads for every write endpoint** — caught after a real integration attempt sent `{ "contact": { phones: [...] } }` (nested under a `contact` key) and got a `422`, because every settings payload is flat, not wrapped in its own category name (the category is already implied by the URL). Every `PUT`/`POST` now has its own field table plus a full request/response JSON example: `PUT /admin/settings/brand`, `POST /admin/settings/brand/logo`, `PUT /admin/settings/contact` (including an explicit note that all 3 array keys — `phones`/`emails`/`socialLinks` — must be sent on every request, even to change just one of them), `PUT /admin/settings/homepage`, `POST /admin/settings/homepage/hero-image`, `PUT /admin/settings/policies`. No actual endpoint or shape change — this is a documentation fix, the behavior was already correct.
2. No other changes.

## Changes from v2.22 — read before integrating

1. **§8 (Settings) has a new "no create/delete" section** — clarifies that this is intentional, not a gap: `PUT` is both create and update for a category, categories are never deleted (clear via `PUT` with empty/null values instead), and `phones`/`emails`/`socialLinks` are full-replace arrays with no per-entry endpoints (same pattern as Product's `colors`/`sizes`). No actual endpoint or shape change — this was already true as of v2.22, just wasn't spelled out.
2. No other changes.

## Changes from v2.21 — read before integrating

1. **Settings is now live** (§8) — `GET /settings` (public, aggregated) plus per-category admin `GET`/`PUT` for `brand`/`contact`/`homepage`/`policies`. Replaces the old placeholder shape entirely (paths, fields, everything). Contact info holds arbitrary-length `phones`/`emails`/`socialLinks` arrays, not fixed fields. Brand logo and homepage hero image are separate multipart upload endpoints (`POST .../logo`, `POST .../hero-image`), not writable fields on the regular `PUT`.
2. No other endpoint or shape changes.

## Changes from v2.20 — read before integrating

1. **`PATCH /admin/roles/{id}`'s `permissionIds` validation fixed** (§2.4) — shipped in v2.20 documented as accepting an empty array, but the backend's `required` validation rule actually rejected `{ "permissionIds": [] }` with a 422 (`"The permission ids field is required."`) — Laravel's `required` rule treats an empty array as absent. Fixed to `present` instead of `required`, which only demands the key exist in the payload, not that it be non-empty. `{ "permissionIds": [] }` now works as originally documented and actually revokes every permission from the role.
2. No other endpoint or shape changes.

## Changes from v2.18 — read before integrating

1. **Activity Log is now live** (§10) — `GET /admin/activity` returns real data on `spatie/laravel-activitylog`'s shape. Replaces the old placeholder example entirely: `userId`/`action` are gone, replaced by `logName`/`event`/`description`/`subjectType`/`subjectId`/`causerId`/`causerName`. `causerId`/`causerName` are `null` for guest-triggered entries (checkout) and failed login attempts.
2. No other endpoint or shape changes.

## Changes from v2.17 — read before integrating

1. **`GET /admin/orders` list items: `customerPhone`/`whatsappNumber` fixed to camelCase** (§4) — these had briefly shipped as `customer_phone`/`whatsapp_number` (snake_case), inconsistent with every other field on this and every other endpoint. If your integration already reads the snake_case keys, switch to `customerPhone`/`whatsappNumber` — this is a breaking key-name change for those two fields only, nothing else on the list item moved.
2. No other endpoint or shape changes.

## Changes from v2.16 — read before integrating

1. **Dashboard gained 3 "recent" lists** (§7) — `recentOrders`, `recentProducts`, `recentCustomers`, latest 5 each, added to the same `GET /admin/dashboard-overview` response alongside the existing 5 scalar stats. Each list uses the exact same row shape as that entity's own admin list endpoint (`GET /admin/orders`, `GET /admin/products`, `GET /admin/customers`) — nothing new to parse.
2. No other endpoint or shape changes.

## Changes from v2.15 — read before integrating

1. **Dashboard's first slice is now live** (§7) — `GET /admin/dashboard-overview` returns `totalProducts`, `productsInStock`, `productsOutOfStock`, `totalCategories`, `newOrders`. Replaces the old placeholder example, which listed a much larger field set (`activeProducts`, `pendingOrders`, `completedOrders`, `enquiries`, `lowStockProducts`, `recentProducts`, `recentOrders`, `recentEnquiries`) that isn't built yet — those will be added as fields to this same object over time as their owning modules exist to source them, not a reshape.
2. No other endpoint or shape changes.

## Changes from v2.14 — read before integrating

1. **`GET /admin/roles` and `GET /admin/permissions` are new** (§2.4) — previously there was no way to list either, only create/assign endpoints (`POST /roles`, `POST /roles/{id}/permissions`). Needed for the user-management UI's role/permission pickers. Both unpaginated, plain array under `data`.
2. No other endpoint or shape changes.

## Changes from v2.13 — read before integrating

1. **New `orderNumber` field on every order object** (e.g. `ORD-000100`), and **order routes now use it instead of the numeric `id`**: `GET/PATCH /admin/orders/{orderNumber}`, `POST /admin/orders/{orderNumber}/cancel`. `id` still appears in responses but is no longer used for routing or in any error message — build all order links/actions around `orderNumber` going forward.
2. **Error messages that reference an order now name it by `orderNumber`** (e.g. `"Order ORD-000100 cannot move from..."`), not a raw numeric id.
3. **`?search=` on `GET /admin/orders` now also matches `orderNumber`**, alongside customer name/phone.
4. No other endpoint or shape changes.

## Changes from v2.12 — read before integrating

1. **Order status changes via `PATCH /admin/orders/{id}` are now strict forward-only**, one step at a time: `new` → `confirmed` → `processing` → `ready_for_delivery` → `delivered`. Skipping stages or moving backward now fails with a `422` — previously any status could be set from any other. **Update the status-change UI to offer only the single valid next status, not a free-choice dropdown.**
2. **`delivered` is now also a terminal state**, same treatment `cancelled` already had — no further status changes accepted once an order is delivered. `notes` remains editable regardless.
3. No other endpoint or shape changes.

## Changes from v2.11 — read before integrating

1. **Order cancellation moved to its own endpoint**: `POST /admin/orders/{id}/cancel`. **`status: cancelled` is no longer accepted by `PATCH /admin/orders/{id}`** — sending it now fails validation (`422`). If your admin UI currently sets `status` to `"Cancelled"` via the generic status dropdown/update call, that has to change to a separate "Cancel order" action hitting the new endpoint.
2. **Cancelling restocks inventory** for every line item in the order — this wasn't happening before (cancellation was previously just a status flip with no side effects documented).
3. **Cancellation only works from `new`/`confirmed`/`processing`/`ready_for_delivery`** — not `delivered`, and not an already-`cancelled` order. Both return a `422` with a message naming the current status.
4. **`cancelled` is now a terminal state** — once set, no further `status` changes are accepted on that order via `PATCH` (notes still editable).
5. No other endpoint or shape changes.

## Changes from v2.10 — read before integrating

1. **New standard: every admin-only route now has an `admin/` prefix, unconditionally** — not just routes that happened to collide with a public route at the same path. **Order's admin routes are renamed**: `GET /orders` → `GET /admin/orders`, `GET /orders/{id}` → `GET /admin/orders/{id}`, `PATCH /orders/{id}` → `PATCH /admin/orders/{id}`. `POST /orders` (checkout) is unaffected — it's public, not admin.
2. **Not-yet-built sections updated to the same standard** (nothing here was live yet, so no breaking change): §5's `POST /faq` → `POST /admin/faq` (same for `PATCH`/`DELETE /faq/{id}`), `GET /enquiries` → `GET /admin/enquiries`, `PATCH /enquiries/{id}` → `PATCH /admin/enquiries/{id}`; §7's Dashboard moved from `/settings/dashboard-overview` to `/admin/dashboard-overview` (also no longer nested under Settings); §8's Settings endpoints all gained `admin/` (e.g. `/settings/brand-content` → `/admin/settings/brand-content`); §10's Activity Log moved from `/activity` to `/admin/activity`.
3. **Not applied retroactively** to already-shipped Auth (`/users`, `/roles`, etc.), Product/Category, Inventory, Customer, or Media routes — those keep their existing paths unchanged.
4. No other endpoint or shape changes.

## Changes from v2.9 — read before integrating

1. **Order module is live**: `POST /orders` (public checkout), `GET /orders`, `GET /orders/{id}`, `PATCH /orders/{id}` (all admin). Previously documented but not yet backed by a working implementation.
2. **The full order object (checkout response, `GET /orders/{id}`, `PATCH /orders/{id}`) includes more fields than earlier drafts of this section showed** — `customerPhone`, `whatsappNumber`, `customerEmail`, `notes`, `createdAt`, `updatedAt`, alongside `id`/`status`/`customerName`/`totalAmount`/`items`. `GET /orders` list items stay trimmed to the smaller shape.
3. **Checkout can fail with a `422` for insufficient stock**, distinct from validation errors — see the new note under "Orders" for the exact message shape. This is expected/handled behavior (e.g. two customers racing to buy the last unit of something), not a bug if you see it.
4. No other endpoint or shape changes.

## Changes from v2.8 — read before integrating

1. **`GET /products` and `GET /products/{slug}` gained a nested `category` field** — the full category object (same shape as `GET /categories`), not just an ID. **Admin product responses (`GET /admin/products`, `GET /admin/products/{id}`) deliberately keep `categoryId` only** — this is a difference between the public and admin shapes, not an inconsistency to report as a bug.
2. **`PATCH /products/{id}` now documented to return the full updated admin product object**, wrapped in `data` — this had briefly been returning an empty `{"success": true}` acknowledgment during backend testing; that was never intended to ship and is now corrected back to returning the product.
3. No other endpoint or shape changes.

## Changes from v2.7 — read before integrating

1. **`GET /admin/products` and `GET /admin/products/{id}` responses gained a new `quantity` field** — the raw Inventory stock count, alongside the existing `stockStatus`. Admin-only, same treatment as `buyingPrice`; not added to the public `GET /products`/`GET /products/{slug}` responses.
2. No other endpoint or shape changes.

## Changes from v2.6 — read before integrating

**No payload shapes changed in this revision** — this is a documentation-clarity pass only, prompted by a real integration bug: `specifications` on `POST /products` was reported as causing a validation error when omitted, when it's actually optional and always was. The rules were just never spelled out field-by-field, only shown via example JSON that didn't distinguish required from optional.

1. **Every request payload in this document (POST/PATCH/PUT bodies) now has a Field/Rules/Description table**, not just an example JSON blob. See §1.1 for how to read the Rules column. Use these tables, not the example payloads, to determine what's actually required.
2. **§2.4 is new** — `POST /users`, `POST /roles`, `POST /users/{id}/roles`, `POST /roles/{id}/permissions` are documented for the first time. These endpoints already existed and worked; they were simply missing from this document.
3. **`PATCH /admin/users/{id}` now explicitly notes it replaces the user's full role list**, unlike the additive `POST /users/{id}/roles`.
4. **`POST /media/upload`'s response example corrected** to show the full object it actually returns (`id`, `folder`, `originalFilename`, `mimeType`, `size`, `uploadedBy`, `createdAt`, in addition to `url`) — the old example only showed `url`, which undersold what's available.
5. No endpoints added/removed, no field added/removed/renamed on any request or response beyond item 4 above.

## Changes from v2.5 — read before integrating

1. **`imageUrls` / `imageUrl` are no longer accepted on `POST`/`PATCH /products` or `/categories`.** A product or category is now created/edited with no images, then images are attached separately:
   - `POST /products/{id}/images` (multipart, `images[]`, multiple files at once) — appends, doesn't replace
   - `DELETE /products/{id}/images/{imageId}`
   - `POST /categories/{id}/image` (multipart, `image`) — replaces the category's single image
   - `DELETE /categories/{id}/image`
     This replaces the old flow of calling `POST /media/upload` first and pasting the returned URL into the product/category payload.
2. **`GET /admin/products` and `GET /admin/products/{id}` responses gained a new `images: [{id, url, sortOrder}]` field**, alongside the unchanged `imageUrls: string[]`. You need `images[].id` to call the new delete-image endpoint — `imageUrls` alone doesn't expose it.
3. **§6 (Media) has a new note** clarifying `POST /media/upload` is still available for general-purpose uploads, but is no longer required for product/category images specifically.
4. All other endpoints and shapes are unchanged from v2.5.

## Changes from v2.4 — read before integrating

1. **`GET /admin/categories` is new** — previously admins had no way to see hidden (`visible: false`) categories via the API; the only listing was the public `GET /categories`, which filters to `visible: true`. Same object shape as the public list, just unfiltered. Mirrors the `GET /admin/products` split from v2.2.
2. No other endpoint changes.

## Changes from v2.3 — read before integrating

1. **`POST /products` now accepts an optional `quantity` field** — sets initial Inventory stock in the same request, so you don't have to immediately follow up with `PATCH /products/{id}/inventory`. Create-only; not accepted on `PATCH /products/{id}`.
2. **`stockStatus` auto-derivation is now bidirectional.** Previously only documented for the zero-crossing case; sending a positive `quantity` with no explicit `stockStatus` now correctly auto-sets `IN_STOCK` too (this was actually a bug in the initial Inventory build — restocking via quantity alone left the status stuck at `OUT_OF_STOCK`). No API shape change, just corrected behavior.
3. No other endpoint changes.

## Changes from v2.2 — read before integrating

1. **`stockStatus` is now live data**, not a placeholder. Every product response (`GET /products`, `GET /products/{slug}`, `GET /admin/products`, `GET /admin/products/{id}`) returns a real value from the Inventory module. `GET /products/{id}/inventory` / `PATCH /products/{id}/inventory` are now fully functional (previously documented but not yet backed by a working module).
2. **Every error response now reliably includes `"success": false`.** Previously, validation errors, 401/403/404/429, and uncaught 500s used Laravel's own default JSON shape, which omits the `success` key entirely — if your error-handling code checked `response.success === false` specifically (rather than just falsy/undefined), it may not have matched. This is now fixed globally; safe to rely on `success` being present and `false` on every error from here on.
3. No changes to any endpoint shape beyond what's noted above.

## Changes from v2.1 — read before integrating

1. **`GET /admin/products` is new.** Previously the admin dashboard had no dedicated product listing and would have had to reuse the public `GET /products` (which silently drops drafts/archived products and never returns `buyingPrice`). Use `GET /admin/products` for any admin-facing product table/grid.
2. No changes to any other endpoint or shape — everything else in this document is unchanged from v2.1.

## Changes from v2.0 — read before integrating

1. **§2.1 is new.** Cookie-based auth needs `credentials: include` (or axios' `withCredentials`) on every request, plus a `GET /sanctum/csrf-cookie` call before the first state-changing request. If you're not using axios, you must manually read, URL-decode, and set the `X-XSRF-TOKEN` header — this was the source of `419 CSRF token mismatch` errors during backend testing.
2. **§2.2 now lists the full permission key catalog**, replacing the illustrative 4-item example in v2.0's login response.
3. **§2.3 is new.** Password reset requires a frontend-hosted `/reset-password` page (reads `token`/`email` from query string). This page did not exist as a requirement in v2.0 — without it, `POST /auth/forgot-password` sends a dead link.
4. No changes to Products, Orders, Contact/FAQ/Newsletter, Media, Dashboard, Settings, Admin Users, or Activity Log sections — all endpoints and shapes are unchanged from v2.0.

## Changes from the original v1.1 spec (carried forward from v2.0, still applies)

1. Login no longer returns a `token`. Session auth is cookie-based via Sanctum.
2. Login and `/auth/user` now return `permissions`, not just `role`.
3. `GET /faq` and `GET /settings/dashboard-overview` are wrapped in `data`.
4. Product pricing is `price` + `salePrice`.
5. `buyingPrice` is admin-only and never appears on any public-facing product response.
6. Checkout (`POST /orders`) does not accept a `total`. It's computed server-side; any client-sent total is silently ignored.
7. Product `status` no longer includes `out_of_stock` — stock is entirely represented by inventory's `stockStatus`.
8. Admin user roles are plural (`roleIds: []`) — a user can hold multiple roles.
9. No `DELETE /orders/{id}`. Cancellation is `PATCH status: cancelled`.
