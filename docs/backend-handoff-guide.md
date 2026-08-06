# Backend Handoff Guide (Zurie)

Version: 1.0
Project: Zuriè Luxury Handbags Website
Frontend: Next.js 15 + TypeScript + Material UI
Backend: Laravel 12 REST API
Prepared by: Frontend Team

## Purpose

This is the single source of truth for backend integration.
It merges the previous specification and guide into one document and reflects the currently implemented frontend service contracts.

Any backend changes to endpoint paths, HTTP methods, payload keys, or response shape must be aligned with frontend before release.

## Architecture Overview

```text
                    ZURIÈ
                      │
             ┌────────┴────────┐
             │                 │
        Customer Website   Admin Dashboard
             │                 │
             └────────┬────────┘
                      │
               Next.js Frontend
                      │
                API Service Layer
                      │
                REST JSON API
                      │
                 Laravel Backend
                      │
        ┌─────────────┴─────────────┐
        │                           │
    MySQL Database            File Storage
```

---

## 1) Objective

Backend should power:
- Admin authentication and role access
- Admin CRUD for products, categories, media, FAQ, users
- Admin operations for orders and enquiries
- Dynamic homepage/content/contact settings
- Storefront product listing, category filtering, and product details
- Contact form submissions and newsletter subscriptions
- Dashboard overview metrics

## 2) Frontend Runtime Expectations

Frontend service layer lives in:
- `services/api/client.ts`
- `services/api/endpoints.ts`
- domain services under `services/*`

Important behavior:
- Requests are made with `credentials: include`
- Default content-type is JSON except FormData uploads
- Error message is read from response `message` or `error`
- Some modules expect wrapped data (`{ data: ... }`), others expect direct arrays or specific keys

## 3) Environment and Base URL

Required env vars:
- `NEXT_PUBLIC_API_URL` example: `https://api.example.com/api`
- `NEXT_PUBLIC_API_MODE` should be `laravel` for real backend mode

All endpoints below are relative to `NEXT_PUBLIC_API_URL`.

## 4) Auth and Session Contract

### POST `/auth/login`
Request:
```json
{
  "email": "admin@zurie.local",
  "password": "admin12345"
}
```
Response:
```json
{
  "token": "jwt-or-session-token",
  "user": {
    "id": 1,
    "name": "Local Admin",
    "email": "admin@zurie.local",
    "role": "super_admin"
  }
}
```

### POST `/auth/logout`
Response:
```json
{ "success": true }
```

### GET `/auth/user`
Response must be wrapped:
```json
{
  "data": {
    "id": 1,
    "name": "Local Admin",
    "email": "admin@zurie.local",
    "role": "super_admin"
  }
}
```

### POST `/auth/forgot-password`
### POST `/auth/reset-password`
Response:
```json
{ "success": true }
```

## 5) API Standards (Apply Everywhere)

- Use UTC ISO timestamps for date fields
- Use numeric integer IDs for all entities (`id`) and references (`*_id`)
- Route params like `/products/{id}` must receive integer IDs
- Pagination format:
```json
{
  "data": [],
  "count": 0,
  "page": 1,
  "pageSize": 10
}
```
- Validation errors should return HTTP 422 with a readable `message`
- Unexpected errors should return HTTP 500 with `message`
- For auth failures, return 401 with `message`

## 6) Endpoint Contract by Domain

## 6.1 Products

Used by storefront and admin.

### GET `/products`
Query params supported:
- `category` (optional)

Current frontend expectation for compatibility:
- Admin reads `products`
- Storefront reads `products` first, then falls back to `data`

Recommended response:
```json
{
  "products": [
    {
      "id": 1,
      "name": "Aurelia Structured Top Handle",
      "slug": "aurelia-structured-top-handle",
      "description": "...",
      "short_description": "...",
      "price": 220,
      "sale_price": null,
      "sku": "AUR-001",
      "status": "published",
      "material": "Full-grain leather",
      "seo_title": "...",
      "seo_description": "...",
      "featured_image_url": "/images/products/aurelia-1.png",
      "category": "handbags",
      "featured": true,
      "best_seller": true,
      "new_arrival": false,
      "in_stock": true,
      "stock_count": 13,
      "colors": [{ "name": "Noir", "hex": "#1f1f1f" }],
      "sizes": ["One Size"],
      "specifications": ["Gold-tone clasp"],
      "product_images": [
        {
          "id": 101,
          "url": "/images/products/aurelia-1.png",
          "alt_text": "Aurelia bag front",
          "is_primary": true
        }
      ],
      "created_at": "2026-08-01T10:00:00.000Z"
    }
  ],
  "data": []
}
```

### GET `/products/{slug}`
Storefront product page uses this endpoint.

Recommended response:
```json
{
  "data": {
    "id": 1,
    "slug": "aurelia-structured-top-handle",
    "name": "Aurelia Structured Top Handle",
    "description": "...",
    "price": 220,
    "category": "handbags",
    "featured": true,
    "bestSeller": true,
    "newArrival": false,
    "inStock": true,
    "stockCount": 13,
    "specifications": ["Gold-tone clasp"],
    "colors": [{ "name": "Noir", "hex": "#1f1f1f" }],
    "sizes": ["One Size"],
    "images": [{ "url": "/images/products/aurelia-1.png", "alt": "Aurelia bag front" }]
  }
}
```

Note:
- Storefront model is camelCase (`bestSeller`, `newArrival`, `stockCount`, `images[].alt`)
- Admin model is snake_case (`best_seller`, `new_arrival`, `stock_count`, `product_images`)
- Backend can choose one canonical shape, but if backend chooses snake_case only, add a transform layer in frontend services.

### POST `/products`
### PATCH `/products/{id}`
Request payload expected by frontend is camelCase:
```json
{
  "name": "...",
  "slug": "...",
  "description": "...",
  "shortDescription": "...",
  "price": 220,
  "salePrice": null,
  "sku": "AUR-001",
  "status": "published",
  "material": "...",
  "seoTitle": "...",
  "seoDescription": "...",
  "featuredImageUrl": "https://...",
  "category": "handbags",
  "featured": true,
  "bestSeller": true,
  "newArrival": false,
  "inStock": true,
  "stockCount": 13,
  "colors": [{ "name": "Noir", "hex": "#1f1f1f" }],
  "sizes": ["One Size"],
  "specifications": ["..."],
  "imageUrls": ["https://..."]
}
```
Response:
```json
{ "success": true, "id": 1 }
```

### DELETE `/products/{id}`
Response:
```json
{ "success": true }
```

### POST `/products/{id}/duplicate`
Response:
```json
{ "success": true, "id": 2 }
```

## 6.2 Categories

### GET `/categories`
Frontend supports either `categories` or `data`.
Recommended:
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Handbags",
      "slug": "handbags",
      "description": "...",
      "image_url": "https://...",
      "is_visible": true,
      "sort_order": 1
    }
  ],
  "data": []
}
```

### POST `/categories`
### PATCH `/categories/{id}`
Request payload (from frontend):
```json
{
  "name": "Handbags",
  "slug": "handbags",
  "description": "...",
  "imageUrl": "https://...",
  "visible": true,
  "sortOrder": 1
}
```
Response:
```json
{ "success": true }
```

### DELETE `/categories/{id}`
Response:
```json
{ "success": true }
```

## 6.3 Orders

### GET `/orders`
Query params:
- `page`
- `pageSize`
- `search` (optional)
- `status` (optional)

Response:
```json
{
  "data": [
    {
      "id": 1,
      "order_number": "ZR-1001",
      "customer_name": "Jane Doe",
      "customer_phone": "+255...",
      "whatsapp_number": "+255...",
      "total_amount": 220,
      "status": "new",
      "notes": null,
      "created_at": "2026-08-01T10:00:00.000Z"
    }
  ],
  "count": 1,
  "page": 1,
  "pageSize": 10
}
```

### PATCH `/orders/{id}`
Request:
```json
{
  "status": "confirmed",
  "notes": "Optional admin note"
}
```
Response:
```json
{ "success": true }
```

### POST `/orders`
Checkout creates order using:
```json
{
  "customerName": "Jane Doe",
  "customerPhone": "+255...",
  "whatsappNumber": "+255...",
  "total": 220,
  "items": [
    {
      "quantity": 1,
      "product": { "name": "Aurelia", "price": 220 }
    }
  ]
}
```
Response:
```json
{ "success": true, "id": 1 }
```

## 6.4 Enquiries and Contact

### POST `/contact`
Contact form submits here.
Request:
```json
{
  "name": "Customer",
  "email": "customer@email.com",
  "message": "Subject + phone + message body combined text"
}
```
Response:
```json
{ "success": true }
```

### GET `/enquiries`
Query params:
- `page`
- `pageSize`
- `search` (optional)
- `status` (optional)

Response:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Customer",
      "email": "customer@email.com",
      "phone": null,
      "message": "...",
      "status": "new",
      "created_at": "2026-08-01T10:00:00.000Z"
    }
  ],
  "count": 1,
  "page": 1,
  "pageSize": 10
}
```

### PATCH `/enquiries/{id}`
Request:
```json
{ "status": "responded" }
```
Response:
```json
{ "success": true }
```

## 6.5 FAQ

### GET `/faq`
Current frontend expects direct array, not wrapped:
```json
[
  {
    "id": 1,
    "question": "How long is delivery?",
    "answer": "...",
    "display_order": 1,
    "is_visible": true,
    "created_at": "2026-08-01T10:00:00.000Z",
    "updated_at": "2026-08-01T10:00:00.000Z"
  }
]
```

### POST `/faq`
### PATCH `/faq/{id}`
Request:
```json
{
  "question": "...",
  "answer": "...",
  "display_order": 1,
  "is_visible": true
}
```
Response:
```json
{ "success": true, "id": 1 }
```

### DELETE `/faq/{id}`
Response:
```json
{ "success": true }
```

## 6.6 Content and Website Settings

### GET `/settings/brand-content`
Response (wrapped):
```json
{
  "data": {
    "heroTitle": "...",
    "heroSubtitle": "...",
    "heroImage": "https://...",
    "story": "...",
    "mission": "...",
    "vision": "...",
    "qualityCommitment": "..."
  }
}
```

### PUT `/settings/brand-content`
Request: partial BrandContent.
Response:
```json
{ "success": true }
```

### GET `/settings/contact-info`
Response (wrapped):
```json
{
  "data": {
    "whatsappNumber": "255718752434",
    "phone": "+255 718 752 434",
    "email": "hello@zurie.co.tz",
    "address": "Dar es Salaam, Tanzania",
    "mapEmbedUrl": "https://maps.google.com/...",
    "instagram": "https://instagram.com/...",
    "facebook": "https://facebook.com/...",
    "tiktok": "https://tiktok.com/..."
  }
}
```

### PUT `/settings/contact-info`
Request: partial ContactInfo.
Response:
```json
{ "success": true }
```

### GET `/settings/homepage`
Response (wrapped):
```json
{
  "data": {
    "heroTitle": "...",
    "heroSubtitle": "...",
    "heroDescription": "...",
    "heroButtonText": "...",
    "heroButtonLink": "/shop",
    "heroImage": "https://...",
    "heroActive": true,
    "bannerTitle": "...",
    "bannerDescription": "...",
    "bannerImage": "https://...",
    "bannerCtaText": "Learn More",
    "bannerCtaLink": "/shop",
    "bannerActive": false,
    "featuredProductIds": [1],
    "newArrivalProductIds": [2]
  }
}
```

### PUT `/settings/homepage`
Request: homepage object above (partial allowed).
Response:
```json
{ "success": true }
```

## 6.7 Dashboard Overview

### GET `/settings/dashboard-overview`
Current frontend expects direct object (not wrapped):
```json
{
  "totalProducts": 120,
  "activeProducts": 100,
  "outOfStockProducts": 20,
  "totalCategories": 8,
  "pendingOrders": 6,
  "completedOrders": 250,
  "enquiries": 14,
  "lowStockProducts": [{ "id": 1, "name": "Aurelia", "stock_count": 2 }],
  "recentProducts": [{ "id": 2, "name": "Serene", "stock_count": 9 }],
  "recentOrders": [{ "id": 1, "order_number": "ZR-1001", "status": "new" }],
  "recentEnquiries": [{ "id": 1, "name": "Jane", "status": "new" }]
}
```

## 6.8 Media Library

### GET `/media`
Query params:
- `page`
- `pageSize`
- `search` (optional)

Response:
```json
{
  "data": [
    {
      "id": 1,
      "file_name": "hero.jpg",
      "file_url": "https://cdn.../hero.jpg",
      "mime_type": "image/jpeg",
      "size_bytes": 182739,
      "folder": "homepage",
      "used_in": ["homepage.hero"],
      "created_at": "2026-08-01T10:00:00.000Z"
    }
  ],
  "count": 1,
  "page": 1,
  "pageSize": 20
}
```

### POST `/media/upload`
Content type: `multipart/form-data`
Form fields:
- `file`: binary file
- `folder`: string

Response:
```json
{
  "success": true,
  "url": "https://cdn.../uploaded-file.jpg"
}
```

### DELETE `/media/{id}`
Response:
```json
{ "success": true }
```

## 6.9 Admin Users

### GET `/admin/users`
Response (wrapped):
```json
{
  "data": [
    {
      "id": 1,
      "full_name": "Admin User",
      "role": "admin",
      "created_at": "2026-08-01T10:00:00.000Z"
    }
  ]
}
```

### PATCH `/admin/users/{id}`
Request:
```json
{ "role": "staff" }
```
Response:
```json
{ "success": true }
```

## 6.10 Activity Log

### GET `/activity`
Query params:
- `page`
- `pageSize`

Response:
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "action": "product.created",
      "resource": "products",
      "created_at": "2026-08-01T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

## 6.11 Newsletter

### POST `/newsletter`
Request:
```json
{ "email": "customer@email.com" }
```
Response:
```json
{ "success": true }
```

## 7) Enums and Validation Rules

Use these values to avoid frontend mismatch:

- `role`: `super_admin | admin | staff`
- `order.status`: `new | confirmed | processing | ready_for_delivery | delivered | cancelled`
- `enquiry.status`: `new | read | responded | archived`
- `product.status`: `draft | published | out_of_stock | archived`

Validation minimums:
- product `name`, `slug`, `description`, `category`, `price`
- category `name`, `slug`
- enquiry/contact `name`, `email`, `message`
- faq `question`, `answer`

## 8) Dynamic Areas Checklist

When all items are complete, website is dynamic:

- Admin login/logout/current user works
- Product CRUD + duplicate works
- Category CRUD works
- Order list + status update works
- Enquiry list + status update works
- FAQ CRUD works
- Media upload/list/delete works
- Admin users list + role update works
- Dashboard metrics populate from backend
- Homepage settings save and reflect on storefront
- Brand and contact settings save and reflect on public pages
- Shop and product detail pages load from backend
- Contact form writes to backend
- Newsletter writes to backend

## 9) Suggested Delivery Plan for Backend Team

Phase 1 (critical):
- Auth, products, categories, content settings, media upload

Phase 2:
- Orders, enquiries, dashboard, admin users

Phase 3:
- FAQ, activity log, newsletter hardening

## 10) Notes for Backend Team

- Keep endpoint paths exactly as listed in `services/api/endpoints.ts`
- Keep response shape exactly as expected above for each endpoint
- If backend standard is different, update frontend service mappers before release
- Prefer CDN/object storage for media URLs used in product/content settings
