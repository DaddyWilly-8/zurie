# Admin Dashboard

## Routes
- `/admin`
- `/admin/products`
- `/admin/categories`
- `/admin/orders`
- `/admin/enquiries`
- `/admin/homepage`
- `/admin/content`
- `/admin/media`
- `/admin/settings`
- `/admin/users`
- `/admin/activity`

## UX Structure
- `components/admin/admin-shell.tsx`: sidebar, topbar, breadcrumbs, logout
- `components/admin/admin-auth-guard.tsx`: client-side admin access guard
- `features/admin/*`: module-specific screens and CRUD forms

## Data Access
Admin features consume domain services only.

Examples:
- products: `productService`
- categories: `categoryService`
- orders: `orderService`
- enquiries: `enquiryService`
- homepage/content/settings: `contentService`
- media: `mediaService`
- users: `userService`
- activity: `activityService`

## Role-Aware UI
Role data comes from `authService.getCurrentUser()`.

Current mock implementation includes role values:
- `super_admin`
- `admin`
- `staff`

Later Laravel integration should enforce server-side role permissions and return role in auth-user payload.

## Responsiveness
Admin UI uses Material UI responsive primitives:
- drawer behavior for mobile navigation
- responsive grid layouts
- table wrapping in overflow containers
- form controls sized for touch and desktop
