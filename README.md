# Zuriè Luxury Handbags E-Commerce

Production-ready Next.js App Router storefront and admin dashboard for a luxury women’s handbag brand.

## Stack

- Next.js App Router + TypeScript
- Material UI + Tailwind + Framer Motion
- Local in-memory data store (no external database)
- Font Awesome
- ESLint + Prettier + Husky + lint-staged

## Core Features

- Premium responsive storefront (home, about, shop, categories, product details, cart, contact)
- Search, filtering, sorting, quick view, related products
- Wishlist and recently viewed products (client state)
- WhatsApp checkout flow with formatted order payload
- Newsletter and contact enquiry submissions
- Admin dashboard with secure login and protected routes
- Product, category, content, and settings management APIs
- SEO: dynamic metadata, Open Graph, sitemap, robots, canonical
- Performance: lazy image loading, server components, cached product fetch

## Project Structure

```text
app/
components/
features/
lib/
hooks/
services/
actions/
types/
utils/
constants/
providers/
public/
```

## Environment Variables

Copy `.env.example` to `.env.local` and set values:

```bash
cp .env.example .env.local
```

Required for full functionality:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Optional:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_GA_ID`

## Local Development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm run format
```

## Security Notes

- Admin UI routes are server-protected via local session cookie.
- Admin API routes verify local admin session before writes.
- User input validation with Zod.
- Basic request throttling for public form endpoints.
- No secrets are exposed to the frontend.

## Deployment (Vercel)

1. Push repository to Git provider.
2. Import project into Vercel.
3. Add environment variables from `.env.local`.
4. Deploy.

## Future Extensibility

Architecture supports future modules without major refactor:

- Payments (M-Pesa, Airtel Money, cards)
- Customer accounts and order tracking
- Coupons and inventory workflows
- Multi-language and multi-currency
- Analytics dashboards
