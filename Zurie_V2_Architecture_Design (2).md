# Zuriè --- V2 Architecture Design

## 1. Purpose

This document defines the proposed architecture direction for Zuriè V2.

V1 is a storefront + admin CMS with online order/inquiry checkout.

V2 should evolve Zuriè into a **business commerce system** that can
manage:

- Website sales
- Walk-in/POS sales
- Customers
- Inventory
- Purchases
- Suppliers
- Sales reporting
- Profit/loss visibility
- Sales targets

The architecture should also avoid hard-coding the system around
handbags so that the same platform can later support businesses such as
phones, perfumes, shoes or cosmetics.

---

# 2. Core Product Direction

```text
V1
Storefront + Admin CMS
        |
        v
V2
Commerce Core
        |
        +-- Online Sales
        +-- POS Sales
        +-- Customers
        +-- Inventory
        +-- Purchases
        +-- Reports
        |
        v
Future
Multi-Organization Commerce Platform
```

### Key principle

> Design for future multi-tenancy, but implement only the business
> capabilities currently required.

Do not introduce full SaaS complexity until there is a real business
requirement.

---

# 3. High-Level System Architecture

```text
                         ┌─────────────────────┐
                         │      Customers      │
                         └──────────┬──────────┘
                                    │
                                    v
┌─────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND                     │
│                                                         │
│  Public Storefront              Admin / POS             │
│  ─────────────────              ─────────────            │
│  Home                           Dashboard                │
│  Shop                           Products                 │
│  Product                        Orders / Sales           │
│  Cart                           POS                      │
│  Checkout                       Inventory                │
│  Account                        Purchases                │
│  Contact                        Customers                │
│                                 Reports                  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ HTTPS / JSON
                        v
┌─────────────────────────────────────────────────────────┐
│                    LARAVEL API                          │
│                                                         │
│  Auth        Products       Orders / Sales              │
│  Customers   Inventory      Purchases                   │
│  Settings    Reports       Users / Roles                │
│  Media       Notifications Audit Logs                   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        v
┌─────────────────────────────────────────────────────────┐
│                     DATABASE                             │
│                                                         │
│ Organizations*  Users       Products                     │
│ Categories      Customers  Orders                       │
│ Order Items     Inventory   Purchases                   │
│ Suppliers       Payments    Expenses*                   │
│ Settings        Reports*    Audit Logs                   │
└─────────────────────────────────────────────────────────┘

* Future / phased capabilities
```

---

# 4. Frontend Architecture

The current V1 frontend architecture should remain the foundation.

```text
app/
├── (public)/
│   ├── /
│   ├── shop/
│   ├── shop/[slug]/
│   ├── categories/[slug]/
│   ├── cart/
│   ├── contact/
│   ├── about/
│   └── policies/
│
├── (admin)/
│   └── admin/
│       ├── dashboard/
│       ├── products/
│       ├── categories/
│       ├── orders/
│       ├── customers/
│       ├── pos/
│       ├── inventory/
│       ├── purchases/
│       ├── suppliers/
│       ├── reports/
│       ├── settings/
│       └── activity/
│
└── (auth)/
    ├── admin/login/
    ├── admin/forgot-password/
    ├── reset-password/
    └── account/
```

Feature-oriented structure:

```text
features/
├── shop/
├── cart/
├── customer/
└── admin/
    ├── products/
    ├── categories/
    ├── orders/
    ├── customers/
    ├── pos/
    ├── inventory/
    ├── purchases/
    ├── suppliers/
    ├── reports/
    └── settings/
```

Each new admin domain should follow the established pattern:

```text
features/admin/<domain>/
├── <domain>-client.tsx
├── <domain>-actions.ts
├── types.ts
└── index.ts
```

---

# 5. Frontend State Architecture

Continue using the existing separation of responsibilities.

```text
                    FRONTEND STATE
                         |
        ┌────────────────┼────────────────┐
        |                |                |
        v                v                v
     Zustand          Context        TanStack Query
        |                |                |
        v                v                v
 Client-only        App-wide          Server state
 persisted state    configuration      API data
        |                |                |
     Cart             Settings          Products
     Currency         Theme             Orders
     Wishlist                            Customers
     Recently Viewed                     Inventory
                                         Purchases
                                         Reports
```

### Rules

- Zustand → client-only persisted state.
- React Context → app-wide configuration.
- TanStack Query → server state.
- No Redux.
- No SWR.
- No raw API calls inside components.

---

# 6. API Architecture

The frontend communicates only with the remote Laravel API.

```text
Component
    |
    v
Feature Action / Query
    |
    v
Domain Service
    |
    v
apiClient
    |
    v
Laravel API
```

Example:

```text
POS Client
   |
   v
pos-action
   |
   v
order.service.ts
   |
   v
apiClient.post()
   |
   v
POST /admin/orders
```

Never:

```text
Component
   |
   +--> axios.post("/some-url")
```

Instead:

```text
Component
   ↓
Service
   ↓
Central API Client
```

---

# 7. API Layer Organization

```text
services/
├── api/
│   ├── client.ts
│   ├── config.ts
│   └── endpoints.ts
│
├── products/
│   └── product.service.ts
│
├── categories/
│   └── category.service.ts
│
├── orders/
│   └── order.service.ts
│
├── customers/
│   └── customer.service.ts
│
├── inventory/
│   └── inventory.service.ts
│
├── purchases/
│   └── purchase.service.ts
│
├── suppliers/
│   └── supplier.service.ts
│
├── reports/
│   └── report.service.ts
│
├── content/
│   └── content.service.ts
│
└── auth/
    └── auth.service.ts
```

All endpoint paths remain centralized in:

```text
services/api/endpoints.ts
```

---

# 8. Authentication Architecture

V1 uses Laravel Sanctum cookie-based SPA authentication.

V2 should preserve that architecture.

```text
Browser
   |
   | GET /sanctum/csrf-cookie
   v
Laravel Sanctum
   |
   v
CSRF Cookie
   |
   | POST /auth/login
   v
Authenticated Session
   |
   v
GET /auth/user
```

For protected requests:

```text
Browser
   |
   | credentials: include
   v
Laravel API
   |
   v
Session Authentication
   |
   v
Authorization
```

Important:

- Do not introduce bearer tokens just to support POS.
- POS authentication should use the same backend authentication
  foundation.
- Authorization should determine what an authenticated user can do.

---

# 9. User & Role Architecture

V2 introduces more operational users.

Possible roles:

```text
Platform Admin       Future
        |
Organization Admin
        |
Manager
        |
Cashier
        |
Staff
```

For the current Zuriè implementation, the minimum useful distinction may
be:

```text
Admin
Cashier
Staff
```

Example permissions:

```text
Admin
├── Products
├── Inventory
├── Purchases
├── Orders
├── POS
├── Customers
├── Reports
├── Settings
└── Users

Cashier
├── POS
├── Sales
└── Limited customer access

Staff
├── Products / inventory viewing
└── Limited operational access
```

Authorization must be enforced by the backend, not only hidden in the
frontend.

---

# 10. The Most Important V2 Domain Model

The central concept should be:

```text
                SALES / ORDERS
                      |
          ┌───────────┼───────────┐
          |           |           |
       WEBSITE       POS       OTHER
          |           |        CHANNELS
          └───────────┼───────────┘
                      |
                 ORDER ITEMS
                      |
                   PRODUCTS
                      |
                  INVENTORY
```

The system should avoid creating completely separate business logic for:

- Website orders
- POS sales
- WhatsApp sales
- Phone sales

Instead, the source/channel differentiates the transaction.

Example:

```text
source:
    website
    pos
    whatsapp
    phone
    walk_in
    admin
```

This makes reporting much easier.

---

# 11. Order / Sale Lifecycle

Recommended lifecycle:

```text
                CREATED
                   |
        ┌──────────┴──────────┐
        v                     v
     PENDING                PAID
        |                     |
        v                     v
   CONFIRMED             PROCESSING
                              |
                              v
                           SHIPPED
                              |
                              v
                          DELIVERED
```

POS may have a shorter lifecycle:

```text
POS Cart
   |
   v
Payment
   |
   v
Completed Sale
   |
   v
Inventory Updated
```

Cancelled transactions should have an explicit cancellation workflow.

---

# 12. Inventory Architecture

Inventory should be based on stock movements rather than blindly editing
a stock number.

```text
                    INVENTORY
                        |
          ┌─────────────┼─────────────┐
          |             |             |
       PURCHASE        SALE         ADJUSTMENT
          |             |             |
         +20           -2            -1
          |             |             |
          └─────────────┼─────────────┘
                        v
                  STOCK BALANCE
```

Example:

```text
Opening stock:       10
Purchase:           +20
POS sale:             -2
Website sale:        -1
Damaged:             -1
------------------------
Current stock:       26
```

Recommended entity:

```text
inventory_movements
```

Possible fields:

```text
id
organization_id*
product_id
type
quantity
reason
reference_type
reference_id
created_by
created_at
```

\*Organization ownership is future-ready.

---

# 13. Purchase Architecture

```text
Supplier
    |
    v
Purchase
    |
    +── Purchase Items
            |
            +── Product
            +── Quantity
            +── Cost Price
            +── Total
                    |
                    v
              Inventory +
```

Example:

```text
Purchase #PUR-0001

Supplier: ABC Bags Ltd

Classic Tote
20 × 60,000 = 1,200,000

Mini Crossbody
30 × 40,000 = 1,200,000

Total = 2,400,000
```

Receiving a purchase should create inventory movements.

---

# 14. POS Architecture

```text
                 POS
                  |
            Product Search
                  |
                  v
                Cart
                  |
          ┌───────┴────────┐
          |                |
      Customer          Walk-in
          |                |
          └───────┬────────┘
                  v
              Payment
                  |
                  v
             Complete Sale
                  |
          ┌───────┴────────┐
          v                v
       Order/Sale       Inventory
          |                |
          v                v
       Receipt         Stock Update
```

POS should not maintain a completely separate product database.

It uses the same products and inventory as the storefront.

---

# 15. Customer Architecture

Customers can exist in three practical states:

```text
Customer
├── Registered Customer
├── Guest Customer
└── Walk-in Customer
```

Registered customer:

```text
User Account
    |
    v
Customer Profile
    |
    +── Orders
    +── Wishlist
    +── Purchase History
```

Walk-in customer:

```text
POS
  |
  v
Walk-in Customer
  |
  v
Sale
```

Optional customer details such as name and phone can still be recorded
without requiring account creation.

---

# 16. Reporting Architecture

Reports should derive from business transactions rather than manually
entered totals.

```text
                 BUSINESS DATA
                      |
        ┌─────────────┼─────────────┐
        v             v             v
       SALES       PURCHASES     EXPENSES*
        |             |             |
        └─────────────┼─────────────┘
                      v
                REPORTING LAYER
                      |
        ┌─────────────┼─────────────┐
        v             v             v
     Revenue       Profit        Targets
     Reports       Reports       Progress
```

\*Expenses are a later phase.

---

# 17. Profit / Loss Model

Basic business calculation:

```text
Sales Revenue
      |
      - Cost of Goods Sold
      |
      v
Gross Profit
      |
      - Operating Expenses
      |
      v
Net Profit
```

Example:

```text
Sales Revenue       5,000,000
COGS                -3,000,000
------------------------------
Gross Profit         2,000,000

Expenses              -700,000
------------------------------
Net Profit            1,300,000
```

Important:

The system should not claim accurate net profit until the business has
agreed how to record:

- Product cost
- Purchases
- Discounts
- Returns
- Expenses
- Other adjustments

---

# 18. Targets Architecture

```text
Target
├── period
├── target_amount
├── current_amount
├── achievement_percentage
└── remaining_amount
```

Example:

```text
Monthly Target
TZS 15,000,000

Current Sales
TZS 9,500,000

Achievement
63.3%

Remaining
TZS 5,500,000
```

Future targets may support:

```text
Daily
Weekly
Monthly
Quarterly
```

---

# 19. Dashboard Architecture

```text
                    DASHBOARD
                        |
       ┌────────────────┼────────────────┐
       |                |                |
       v                v                v
    Sales Today      Orders          Gross Profit
       |
       v
Monthly Target
       |
       v
Sales by Channel
       |
       v
Inventory Alerts
       |
       v
Recent Transactions
```

Recommended V2 dashboard:

- Sales today
- Orders today
- Gross profit
- Monthly sales target
- Target achievement
- Sales by channel
- Low-stock products
- Recent sales
- Top-selling products

---

# 20. Multi-Organization Future Architecture

The long-term platform should be organization-aware.

```text
                    PLATFORM
                       |
          ┌────────────┼────────────┐
          |            |            |
          v            v            v
      Zuriè         Phone Shop    Perfumes
       Org A          Org B        Org C
          |             |            |
      Products       Products      Products
      Orders         Orders        Orders
      Customers      Customers     Customers
      Inventory      Inventory     Inventory
```

Potential database structure:

```text
organizations
users
organization_users

products
categories
orders
order_items
customers
inventory_movements
purchases
purchase_items
suppliers
settings
```

Many business-owned entities should eventually carry:

```text
organization_id
```

---

# 21. Tenant Isolation

This is a critical security requirement.

Do NOT trust:

```text
?organization_id=2
```

from the browser.

Instead:

```text
Authenticated User
        |
        v
Organization Membership
        |
        v
Current Organization
        |
        v
Authorized Query
        |
        v
Organization Data Only
```

The backend must enforce organization isolation.

Example concept:

```text
Product::where(
    'organization_id',
    currentOrganization()->id
)
```

The frontend should never be the security boundary.

---

# 22. Custom Domain --- Future

Eventually different organizations could use different domains:

```text
zurie.example
     |
     v
Organization A
```

```text
phones.example
     |
     v
Organization B
```

Conceptual flow:

```text
Incoming Request
       |
       v
Host / Domain
       |
       v
Organization Resolver
       |
       v
Organization Settings
       |
       v
Storefront
```

This should be treated as a future SaaS capability, not a V2 requirement
unless commercially necessary.

---

# 23. Domain-Agnostic Product Model

Do not create product types like:

```text
HandbagProduct
PhoneProduct
PerfumeProduct
```

Use:

```text
Product
```

with:

```text
Product
├── name
├── description
├── price
├── images
├── category
├── SKU
├── stock
└── attributes
```

Examples:

```text
Handbag
Category: Handbags

Phone
Category: Phones

Perfume
Category: Perfumes
```

The product domain should remain generic.

Dynamic product attributes can be introduced later if multiple business
categories require them.

---

# 24. Recommended V2 Release Architecture

## V2.0 --- Commerce Core

```text
POS
Sales / Orders
Inventory
Purchases
Customers
Basic Reports
```

## V2.1 --- Operations & Intelligence

```text
Profit / Loss
Targets
Expenses
Supplier Management
Cashier Sessions
Audit Logs
```

## V2.2 --- Customer Experience

```text
Wishlist
Reviews
Notifications
Coupons / Discounts
```

## Future V3 --- SaaS Platform

```text
Organizations
Tenant Isolation
Organization Admin
Subscriptions
Billing
Custom Domains
Tenant Onboarding
Platform Admin
```

---

# 25. Recommended Development Flow

Do not start coding a major version immediately.

Use:

```text
Business Problem
       |
       v
Requirements
       |
       v
Product Scope
       |
       v
Domain Model
       |
       v
API Contract
       |
       v
Database Design
       |
       v
Backend
       |
       v
Frontend
       |
       v
Integration
       |
       v
QA
       |
       v
Production
       |
       v
User Feedback
       |
       v
Next Iteration
```

---

# 26. Project Manager Decision Framework

For every proposed feature, answer:

```text
1. What business problem are we solving?

2. Who experiences the problem?

3. What value does solving it provide?

4. What exactly is in scope?

5. What is out of scope?

6. What domain entities change?

7. What frontend changes are required?

8. What backend/API changes are required?

9. What database changes are required?

10. What dependencies exist?

11. What are the risks?

12. Who owns the implementation?

13. What are the acceptance criteria?

14. How will we test it?

15. How will we know the feature was successful?
```

---

# 27. V1 → V2 Transition

```text
                    V1
                     |
          Storefront + Admin CMS
                     |
                     v
               V1 Review
                     |
        ┌────────────┴────────────┐
        v                         v
   Stability                  Business Gaps
        |                         |
        v                         v
   V1.1 Fixes              V2 Requirements
                                  |
                                  v
                           Commerce Core
                                  |
             ┌────────────────────┼────────────────────┐
             v                    v                    v
            POS               Inventory            Customers
             |                    |                    |
             └────────────────────┼────────────────────┘
                                  v
                           Sales / Orders
                                  |
                                  v
                         Reports / Targets
```

---

# 28. Architecture Principles

### Principle 1 --- One Source of Truth

Products, customers, sales and inventory should not be duplicated across
separate systems.

### Principle 2 --- Backend Is the Security Boundary

Frontend restrictions are for UX. Authorization and tenant isolation
belong in Laravel.

### Principle 3 --- Domain Services Over Raw API Calls

Frontend components should not know endpoint details.

### Principle 4 --- Business Transactions Drive Reports

Do not manually maintain dashboard totals.

### Principle 5 --- Design Generic, Build Practical

Keep products/settings/business entities generic enough for future
businesses, but avoid premature abstraction.

### Principle 6 --- Multi-Tenant Ready, Not Multi-Tenant Overbuilt

Prepare the domain model for organization ownership before there is a
need to build the complete SaaS platform.

### Principle 7 --- Incremental Releases

Prefer V2.0, V2.1 and V2.2 over one giant V2 release.

---

# 29. Final Architecture Vision

```text
                         ZURIÈ PLATFORM
                              |
                 ┌────────────┴────────────┐
                 |                         |
              STOREFRONT               ADMIN APP
                 |                         |
                 |              ┌──────────┼──────────┐
                 |              |          |          |
                 |             POS      Inventory   Reports
                 |              |          |          |
                 └──────────────┴──────────┴──────────┘
                                |
                         LARAVEL API
                                |
        ┌───────────────────────┼────────────────────────┐
        |           |           |          |             |
      Auth       Sales      Products   Inventory     Purchases
        |           |           |          |             |
        └───────────┴───────────┴──────────┴─────────────┘
                                |
                            DATABASE
                                |
                     Future Organization Layer
                                |
              ┌─────────────────┼─────────────────┐
              |                 |                 |
            Zuriè           Phone Shop         Perfumes
```

## Strategic Goal

Zuriè should not become just a better handbag website.

The long-term direction is:

> **A configurable commerce platform that can power different businesses
> from one core system, while V2 remains focused on solving Zuriè's
> actual operational needs first.**

---

# 30. Finance & Accounting Core

Sections 16–18 (Reporting, Profit/Loss, Targets) originally assumed those
could be computed as ad-hoc aggregates over `orders`/`purchases`. That is
fragile the moment the business asks a real accounting question — how much
cash exists right now, what is owed to which supplier, what payment method
a sale actually settled in, or a consistent cost basis across purchases
made at different prices over time. None of that survives on scattered SQL
aggregates. It needs a proper ledger that every other module **posts into**,
not queries around.

This is not full traditional bookkeeping complexity — it is the minimum
correct middle ground: a real double-entry ledger, structured the way
established accounting software (Tally, QuickBooks) structures it, so the
books are mathematically guaranteed to balance rather than "probably"
consistent.

## 30.1 Chart of Accounts — Ledger Groups and Ledgers

```text
ledger_groups                        ledgers
├── id                                ├── id
├── name        ("Current Assets")    ├── ledger_group_id  (FK)
├── code                              ├── name             ("Cash in Hand")
├── parent_id   (nullable, self-FK    ├── code
│                → hierarchy)         ├── opening_balance
├── nature      (asset | liability    ├── current_balance  (cached)
│                | income | expense   ├── reference_type   (nullable — Supplier, ExpenseCategory)
│                | equity)            ├── reference_id      (nullable)
└── is_system   (protects defaults)   └── is_system
```

Default seeded hierarchy:

```text
Assets
├── Current Assets
│   ├── Cash in Hand
│   ├── Bank Account
│   ├── Mobile Money (M-Pesa/Tigo Pesa)
│   └── Inventory Asset
Liabilities
├── Current Liabilities
│   └── Sundry Creditors        ← one ledger per Supplier, auto-created
Income
├── Direct Income
│   ├── Sales Account
│   └── Sales Discounts         ← contra-revenue, see §30.5
Expenses
├── Direct Expenses
│   └── Cost of Goods Sold
└── Indirect Expenses
    └── (one ledger per expense category — Rent, Salaries, Utilities)
Equity
└── Owner's Capital
```

Two kinds of ledgers: **system ledgers** (fixed, seeded, never deletable —
Cash, Bank, Sales, COGS) and **auto-managed ledgers** tied to another
module's record via `reference_type`/`reference_id` — creating a Supplier
automatically creates its matching ledger under Sundry Creditors.

## 30.2 Double-entry journal

```text
journal_entries                      journal_entry_lines
├── id                                ├── id
├── date                              ├── journal_entry_id  (FK)
├── narration                         ├── ledger_id          (FK)
├── reference_type  (Order|Purchase|  ├── cost_center_id     (nullable FK, §31)
│                    Expense|Manual)  ├── type               (debit | credit)
├── reference_id                      └── amount
└── created_by
```

Invariant enforced by `FinanceService`: every `journal_entries` row must
have lines where `sum(debit) === sum(credit)`. Never posted directly by a
controller — always through `FinanceService::postEntry()`/`recordSale()`/
`recordPurchase()`/`recordExpense()`/`createLedgerFor()`.

Example — Purchase from ABC Bags Ltd, 1,200,000, unpaid:

```text
Debit  Inventory Asset      1,200,000
Credit ABC Bags Ltd                    1,200,000
```

That credit balance on the supplier's own ledger **is** accounts payable —
no separate balances table needed, it is `SUM(credits) - SUM(debits)` on
that one ledger. Paying it later debits the supplier's ledger and credits
Bank, driving the balance back to zero.

---

# 31. Cost Centers

Orthogonal to the Chart of Accounts — answers "which department/branch does
this money belong to," independent of which ledger it hit. The same `Rent`
ledger might be split across two branches.

```text
cost_centers
├── id
├── name        ("Head Office", "Kariakoo Branch")
├── parent_id   (nullable, self-FK — hierarchy)
└── is_active
```

`journal_entry_lines.cost_center_id` (nullable) tags any line. Profit/Loss
by branch becomes a filter on this tag, not separate logic:
`SUM(Sales Account credits WHERE cost_center_id = X) - SUM(COGS debits ...)

- SUM(Expense debits ...)`.

---

# 32. Sales Outlets

Different question from `source` (§10's channel enum — website/pos/
whatsapp/phone). `source` is the channel _type_; an Outlet is the specific
_location instance_. A business with two physical shops both doing POS
needs to tell those two apart.

```text
sales_outlets
├── id
├── name           ("Kariakoo Branch", "Online Store")
├── type           (physical | online)
├── address        (nullable)
├── cost_center_id (nullable FK — see below)
└── is_active
```

`orders` gains `outlet_id` (not nullable — one default "Online Store"
outlet is seeded at install so existing website checkout needs zero code
change). Linking each Outlet 1:1 to its own Cost Center means a POS sale at
"Kariakoo Branch" automatically tags every journal line it posts with that
branch's cost center — the cashier never manually assigns accounting tags.

A single-location business does not need more than the one seeded
outlet/cost-center pair. Opening a second location is one new row, not a
schema change.

---

# 33. Price Lists

The same product can have a retail price, a wholesale price, an
outlet-specific price, or a negotiated price for one customer.
`Product.price`/`sale_price` remain the default — Price Lists are optional
overrides on top.

```text
price_lists
├── id
├── name            ("Retail", "Wholesale", "Kariakoo Branch")
├── is_default      (the one that IS Product.price/sale_price — no items needed)
├── outlet_id       (nullable FK)
├── customer_id     (nullable FK — negotiated pricing for one customer)
├── valid_from / valid_to  (nullable — time-boxed promotions)
└── is_active

price_list_items
├── id
├── price_list_id
├── product_id
├── price
└── sale_price      (nullable)
```

Resolution order at checkout/POS, most specific wins: customer-specific
list → outlet-specific list → default list. `OrderService::checkout()`/
`posSale()` resolve price via `PriceListService::resolvePrice()` instead of
reading `Product.price` directly — never trust a client-sent price, same
rule as always.

A future Coupon/Discount feature (§24, V2.2) can be modeled as a
time-boxed Price List rather than inventing a separate discount system.

---

# 34. Order Final Sell Price

Real sales — especially POS/walk-in, where negotiating on price is normal
— need the actual charged price to differ from what `PriceListService`
resolved, with that difference visible and auditable rather than silently
overwritten.

```text
order_items
├── product_id, product_name           (existing)
├── unit_buying_price                  (existing — real cost, never overridden)
├── list_price          (system-resolved price before negotiation)
├── unit_selling_price                 (existing — the ACTUAL final price charged)
├── quantity                           (existing)
├── line_total                         (unit_selling_price × quantity)
└── discount_reason     (nullable)
```

Overriding `unit_selling_price` away from `list_price` requires
`permission:order_price_override`, checked in the service (not just the
route) since it depends on the request data, not only which endpoint was
called. Without it, a cashier's line always settles at `list_price`.

Posted to the ledger as gross revenue plus a contra-revenue discount, not
a quietly-discounted net figure — example, list 250,000 negotiated to
220,000, cost 140,000:

```text
Debit  Cash in Hand        220,000
Debit  Sales Discounts      30,000
Credit Sales Account                    250,000

Debit  Cost of Goods Sold  140,000
Credit Inventory Asset                  140,000
```

`Net Sales = Sales Account − Sales Discounts` matches what actually landed
in the till, while `Sales Discounts` becomes a trackable KPI — total
discounting per month, per cashier (via Cost Center), per product — for
free, straight from the ledger.

---

# 35. Revised Foundations Phase (supersedes the simple version of §16–18)

```text
Phase 0 — Foundations, in dependency order

  0.1  Chart of Accounts        ledger_groups → ledgers (§30.1)
  0.2  Cost Centers             cost_centers (§31)
  0.3  Sales Outlets            sales_outlets, FK → cost_centers (§32)
  0.4  Double-entry ledger      journal_entries → journal_entry_lines (§30.2)
                                 + FinanceService
  0.5  Inventory movements      inventory_movements (append-only, polymorphic)
  0.6  Customer/User split      customers.user_id nullable (§ "Customer
                                 Architecture" revision, see doc history)
  0.7  Price Lists              price_lists → price_list_items (§33)
```

Migration order (FK dependencies): `ledger_groups → ledgers → cost_centers
→ sales_outlets → journal_entries → journal_entry_lines →
inventory_movements → customers.user_id → price_lists → price_list_items`.

Every phase after this (Customer Accounts, Suppliers/Purchases, POS/
Unified Sales, Reports, then V2.1's Profit/Loss/Targets/Expenses) becomes a
**consumer** of these seven pieces — posting into the ledger, tagging a
cost center/outlet, resolving a price list — rather than inventing its own
totals logic. Profit/Loss, Accounts Payable, and Targets in V2.1 become
thin reads over this ledger, not new business logic.

---

# 36. The Extensibility Constitution

Standing requirement, non-negotiable for every module or schema addition
from here forward: adding a future feature must never become a large job,
and must never risk breaking what already exists. Confirmed against the
real backend's existing architecture (module folder convention, service
registration, permission wiring) — this is already how the codebase works
today, and it must keep being followed as V2 grows.

**Rule 1 — Three touchpoints only.** Registering a new module touches
exactly `bootstrap/providers.php`, `routes/api.php`, and
`database/seeders/PermissionSeeder.php`. Everything else — Models,
Services, Controllers, Requests, Resources, migrations — lives entirely
inside `app/Modules/{NewDomain}/` and needs no coordination with any other
module's code.

**Rule 2 — Services only, never Models, across module boundaries.** A
module needing another module's data calls that module's Service class
(e.g. `OrderService` depends on `ProductService`/`CustomerService`/
`InventoryService`, never queries their tables directly). This is what
stops "add one feature" from requiring understanding and touching several
other modules' internals.

**Rule 3 — Polymorphic/generic over enumerated/hardcoded.** Any table
representing "a category of things that will grow" — `inventory_movements
.type`, `journal_entries.reference_type/reference_id`, Cost Centers, Sales
Outlets, Price Lists — grows by adding **rows**, never by adding
**columns** or altering an existing table's schema. A new movement type, a
new branch, a new pricing segment should never require a migration to an
existing table.

Any proposed feature that would violate one of these three rules — reaching
into another module's table directly, requiring a schema change to an
_existing_ table just to represent a new concept, or needing more than the
three touchpoints in Rule 1 — should be flagged and reconsidered before
being built, not built anyway.
