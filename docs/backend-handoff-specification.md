# Zuriè Backend Handoff Specification

Version: 1.1 (Merged)
Project: Zuriè Luxury Handbags Website
Frontend: Next.js 15 + TypeScript + Material UI
Backend: Laravel 12 REST API
Prepared by: Frontend Team

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

## Technology Stack

Frontend
- Next.js App Router
- TypeScript
- Material UI
- Font Awesome

Backend
- Laravel 12
- Laravel Sanctum
- MySQL
- Laravel Storage
- Form Requests
- Policies

## Environment and Runtime

Required env vars
- NEXT_PUBLIC_API_URL (example: https://api.example.com/api/v1)
- NEXT_PUBLIC_API_MODE (laravel for real backend, mock for local mock mode)

Frontend client behavior (implemented)
- Uses credentials: include
- Uses application/json by default
- Uses FormData for media uploads
- Reads error message from message or error fields

Reference files
- services/api/client.ts
- services/api/endpoints.ts

## API Standards

- Base URL prefix: /api/v1
- Time format: ISO 8601 UTC
- Recommended auth: Laravel Sanctum with HTTP-only cookies and CSRF
- Status codes: 200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500

## Naming and Shape Rules

- Database: snake_case
- Admin API payload/rows in current frontend are mostly snake_case
- Storefront models include camelCase in some responses
- ID type: numeric integer for all entity IDs and foreign keys
- Route params like `/products/{id}` use integer IDs

Important:
- Frontend does not currently normalize all endpoints into one common shape.
- Backend should follow the endpoint-specific contracts below exactly.

## Authentication Flow

Expected flow
1. GET /sanctum/csrf-cookie
2. POST /api/v1/auth/login
3. Session cookie established
4. GET /api/v1/auth/user

## Global Error Contract

Validation error example (422)
```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": {
        "name": ["The name field is required."]
    }
}
```

General error example
```json
{
    "success": false,
    "message": "Internal Server Error."
}
```

## Endpoint Contract (Authoritative)

### Authentication

POST /auth/login
```json
{
    "email": "admin@zurie.local",
    "password": "admin12345"
}
```
Response
```json
{
    "token": "session-or-jwt-token",
    "user": {
        "id": 1,
        "name": "Local Admin",
        "email": "admin@zurie.local",
        "role": "super_admin"
    }
}
```

POST /auth/logout
```json
{ "success": true }
```

GET /auth/user
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

POST /auth/forgot-password
POST /auth/reset-password
```json
{ "success": true }
```

### Products

GET /products
Query params
- category (optional)

Response compatibility requirement
- Admin reads products key
- Storefront reads products, then falls back to data

Recommended response
```json
{
    "products": [],
    "data": []
}
```

GET /products/{slug}
Storefront expects wrapped object in data.

POST /products
PATCH /products/{id}
DELETE /products/{id}
POST /products/{id}/duplicate

Product pricing contract
- price is required and numeric
- salePrice is optional and can be null
- Both price and salePrice are stored as base USD values
- Use decimal(12,2) for monetary storage (not float/double)
- Validation:
    - price >= 0
    - salePrice >= 0 when provided
    - salePrice <= price when provided
- If salePrice exists, storefront can treat salePrice as active selling price and price as compare-at/original price
- API request keys from frontend remain camelCase for writes: price, salePrice
- API response may use snake_case for admin rows and camelCase for storefront rows as already defined in this contract

Recommended product response price fields
```json
{
        "price": 220.0,
        "salePrice": 180.0
}
```

Create/update payload (from frontend)
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

Success response
```json
{ "success": true, "id": 1 }
```

### Categories

GET /categories
Frontend supports either categories or data.

Recommended response
```json
{
    "categories": [],
    "data": []
}
```

POST /categories
PATCH /categories/{id}
DELETE /categories/{id}

Request payload
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

### Orders

GET /orders
Query params
- page
- pageSize
- search (optional)
- status (optional)

Response
```json
{
    "data": [],
    "count": 0,
    "page": 1,
    "pageSize": 10
}
```

PATCH /orders/{id}
```json
{
    "status": "confirmed",
    "notes": "Optional admin note"
}
```

POST /orders
Checkout payload
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

Order pricing rules
- total in checkout payload is a client hint only
- Backend must recalculate authoritative totals from server-side product prices
- Persist total_amount as decimal(12,2)
- Store each order line with unit price and computed line total to preserve historical pricing

### Contact and Enquiries

POST /contact
```json
{
    "name": "Customer",
    "email": "customer@email.com",
    "message": "..."
}
```

GET /enquiries
PATCH /enquiries/{id}

GET response shape
```json
{
    "data": [],
    "count": 0,
    "page": 1,
    "pageSize": 10
}
```

PATCH request
```json
{ "status": "responded" }
```

### FAQ

GET /faq
Current frontend expects direct array (not wrapped).

POST /faq
PATCH /faq/{id}
DELETE /faq/{id}

### Website Settings and Content

GET /settings/brand-content
PUT /settings/brand-content

GET /settings/contact-info
PUT /settings/contact-info

GET /settings/homepage
PUT /settings/homepage

GET endpoints above currently expect wrapped response:
```json
{ "data": {} }
```

### Dashboard Overview

GET /settings/dashboard-overview

Current frontend expects direct object (not wrapped), for example fields:
- totalProducts
- activeProducts
- outOfStockProducts
- totalCategories
- pendingOrders
- completedOrders
- enquiries
- lowStockProducts
- recentProducts
- recentOrders
- recentEnquiries

### Media

GET /media
Query params
- page
- pageSize
- search (optional)

Response
```json
{
    "data": [],
    "count": 0,
    "page": 1,
    "pageSize": 20
}
```

POST /media/upload
multipart/form-data with fields:
- file
- folder

Response
```json
{
    "success": true,
    "url": "https://cdn.../uploaded-file.jpg"
}
```

DELETE /media/{id}

### Admin Users

GET /admin/users
Expected response
```json
{ "data": [] }
```

PATCH /admin/users/{id}
```json
{ "role": "staff" }
```

### Activity Log

GET /activity
Query params
- page
- pageSize

Response
```json
{
    "data": [],
    "count": 0
}
```

### Newsletter

POST /newsletter
```json
{ "email": "customer@email.com" }
```

## Enums

- role: super_admin | admin | staff
- order.status: new | confirmed | processing | ready_for_delivery | delivered | cancelled
- enquiry.status: new | read | responded | archived
- product.status: draft | published | out_of_stock | archived

## Security Requirements

Backend must implement:
- Sanctum and CSRF protection
- Authorization policies and role middleware
- Form request validation
- Rate limiting
- Safe file upload validation
- Password hashing
- No sensitive stack trace leaks in API responses

Frontend authorization is not sufficient security.

## Performance Guidelines

- Pagination
- Filtering/searching
- Sorting
- Eager loading
- Proper indexing
- Avoid N+1 queries

## Database Domains (Suggested)

- users
- roles
- products
- product_images
- categories
- orders
- order_items
- enquiries
- faqs
- media
- homepage_settings
- brand_settings
- contact_settings
- activity_logs
- newsletter_subscribers

## Dynamic Completion Checklist

- Admin auth flow works
- Product CRUD and duplicate works
- Category CRUD works
- Orders list and status update works
- Enquiries list and status update works
- FAQ CRUD works
- Media upload/list/delete works
- Admin users list and role update works
- Dashboard metrics load from backend
- Homepage settings are editable and reflected on storefront
- Brand and contact settings are editable and reflected on public pages
- Shop and product details load from backend
- Contact form writes to backend
- Newsletter writes to backend

## Final Note

This merged specification is the official backend contract for current frontend integration.
If backend chooses a different response standard, frontend service mappers must be updated before go-live.