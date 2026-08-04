# API Integration Guide

For full backend implementation requirements (admin + storefront + dynamic content contract), see `docs/backend-handoff-guide.md`.

## Environment Variables
- `NEXT_PUBLIC_API_URL`: Laravel API base URL, current `https://test.weldtech.co.tz/api/v1`
- `NEXT_PUBLIC_API_MODE`: `mock` or `laravel`

## API Client
Shared client is implemented in `services/api/client.ts`.

Capabilities:
- centralized base URL handling
- query parameter support
- timeout handling
- JSON parsing with clear error propagation
- `credentials: include` for cookie-based auth
- Sanctum CSRF bootstrap before state-changing requests
- automatic `X-XSRF-TOKEN` header from cookie

## Endpoint Contracts
All endpoint paths are centralized in `services/api/endpoints.ts`.

Do not hardcode endpoint strings in components.

## Service Pattern
Each module has a service:
- `services/products/product.service.ts`
- `services/categories/category.service.ts`
- `services/orders/order.service.ts`
- `services/enquiries/enquiry.service.ts`
- `services/content/content.service.ts`
- `services/auth/auth.service.ts`

Services decide runtime adapter:
- mock adapter in `services/mock/mock-backend.ts`
- real HTTP calls via `apiClient`

## Expected Laravel Endpoint Examples
- `GET /products`
- `GET /products/{slug}`
- `POST /products`
- `PUT /products/{id}`
- `DELETE /products/{id}`
- `GET /categories`
- `POST /categories`
- `PUT /categories/{id}`
- `DELETE /categories/{id}`
- `GET /orders`
- `PUT /orders/{id}`
- `GET /settings`
- `PUT /settings`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/user`

## Sanctum Authentication
The shared API client now performs Sanctum flow automatically for mutating requests:
- `GET /sanctum/csrf-cookie`
- include cookies with `credentials: include`
- attach `X-XSRF-TOKEN` from cookie

## Backend Availability (Current)
Live and wired to Laravel:
- Auth
- Products and Categories
- Inventory
- Customers (admin read-only)

Temporarily pinned to mock backend until backend endpoints are implemented:
- Orders
- Media upload/library
- FAQ
- Enquiries / Contact
- Newsletter
- Dashboard overview
- Settings / Content
- Activity log

## Error/Loading Pattern
For API-driven screens:
- load on mount
- show loading feedback
- show empty states when collections are empty
- show retry/error feedback for request failures
