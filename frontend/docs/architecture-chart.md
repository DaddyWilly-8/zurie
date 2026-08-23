# Zuriè Repository Architecture Chart

Visual breakdown of the Zuriè Next.js codebase — structure, data flow, and module relationships.

---

## 1. High-Level System Architecture

```mermaid
flowchart TB
    subgraph Client["🌐 Next.js Frontend (Zuriè)"]
        direction TB
        subgraph AppRoutes["app/ — Route Pages"]
            PublicRoutes["(public)/ — Storefront<br/>Home, Shop, Cart, About, Contact"]
            AuthRoutes["(auth)/admin/ — Auth Pages<br/>Login, Forgot/Reset Password"]
            AdminRoutes["(admin)/admin/ — Dashboard<br/>Overview, Products, Orders, Users..."]
        end

        subgraph Components["components/ — Shared UI"]
            SiteHeader["SiteHeader<br/>Nav + Cart Drawer + Search"]
            ProductCard["ProductCard"]
            SiteFooter["SiteFooter"]
            AdminShell["AdminShell<br/>Sidebar + Breadcrumbs + Theme"]
            AdminAuthGuard["AdminAuthGuard"]
        end

        subgraph Features["features/ — Feature Modules"]
            Shop["shop/<br/>Grid, Product Detail"]
            Cart["cart/<br/>Cart Client"]
            AdminFeatures["admin/<br/>Products, Orders, Categories<br/>Users, Media, Customers..."]
        end

        subgraph Hooks["hooks/ — Zustand State"]
            ShopStore["use-shop-store<br/>Cart • Wishlist • Recently Viewed"]
            CurrencyStore["use-currency-store"]
            AdminAuth["use-admin-auth"]
        end
    end

    subgraph Services["⚙️ services/ — Domain Layer"]
        direction TB
        ApiClient["api/client.ts<br/>Axios instance • CSRF <br/>XSRF tokens • Retry"]
        Endpoints["api/endpoints.ts<br/>API route map"]
        DomainServices["Domain Services<br/>auth, products, categories<br/>orders, enquiries, faq<br/>media, users, dashboard<br/>activity, content, customers<br/>notifications"]
    end

    subgraph Backend["🚀 Laravel REST API"]
        direction TB
        Sanctum["Sanctum<br/>Cookie Auth + CSRF"]
        API["api/v1/*<br/>Products, Orders, Admin..."]
        DB[("Database")]
    end

    PublicRoutes --> Components
    AdminRoutes --> Components
    Features --> Components
    Features --> Hooks
    Features --> Services
    Components --> Services
    Routes --> Features
    Services --> ApiClient
    ApiClient --> Backend
    ApiClient --> Endpoints
    Sanctum --> API
    API --> DB
```

---

## 2. Repository Structure Tree

```mermaid
flowchart LR
    ROOT["zurie/"] --> APP["app/"]
    ROOT --> COMP["components/"]
    ROOT --> FEAT["features/"]
    ROOT --> SERV["services/"]
    ROOT --> HOOKS["hooks/"]
    ROOT --> PROV["providers/"]
    ROOT --> TYPES["types/"]
    ROOT --> UTILS["utils/"]
    ROOT --> CONST["constants/"]
    ROOT --> DOCS["docs/"]
    ROOT --> PUBLIC["public/"]
    ROOT --> LIB["lib/"]

    APP --> APP_PUB["(public)/"]
    APP --> APP_AUTH["(auth)/admin/"]
    APP --> APP_ADMIN["(admin)/admin/"]

    APP_PUB --> P_HOME["page.tsx<br/>Homepage (Hero • Featured<br/>Best Sellers • Categories)"]
    APP_PUB --> P_SHOP["shop/page.tsx<br/>Shop listing"]
    APP_PUB --> P_SLUG["shop/[slug]/page.tsx<br/>Product detail"]
    APP_PUB --> P_CART["cart/page.tsx"]
    APP_PUB --> P_ABOUT["about/page.tsx"]
    APP_PUB --> P_CONTACT["contact/page.tsx"]
    APP_PUB --> P_CATS["categories/[slug]/page.tsx"]

    APP_AUTH --> A_LOGIN["login/page.tsx"]
    APP_AUTH --> A_FORGOT["forgot-password/page.tsx"]
    APP_AUTH --> A_RESET["reset-password/page.tsx"]

    APP_ADMIN --> AD_DASH["page.tsx<br/>Overview Dashboard"]
    APP_ADMIN --> AD_PROD["products/page.tsx"]
    APP_ADMIN --> AD_CATS["categories/page.tsx"]
    APP_ADMIN --> AD_ORD["orders/page.tsx"]
    APP_ADMIN --> AD_CUST["customers/page.tsx"]
    APP_ADMIN --> AD_ENQ["enquiries/page.tsx"]
    APP_ADMIN --> AD_FAQ["faq/page.tsx"]
    APP_ADMIN --> AD_MED["media/page.tsx"]
    APP_ADMIN --> AD_USERS["users/page.tsx"]
    APP_ADMIN --> AD_ACT["activity/page.tsx"]
    APP_ADMIN --> AD_CONTENT["content/page.tsx"]
    APP_ADMIN --> AD_HOME["homepage/page.tsx"]
    APP_ADMIN --> AD_SET["settings/page.tsx"]
    APP_ADMIN --> AD_L["layout.tsx"]

    COMP --> C_HEADER["site-header/<br/>cart-drawer, nav-links<br/>header-actions, search-panel"]
    COMP --> C_ADMIN["admin/<br/>admin-shell, admin-auth-guard<br/>admin-field, admin-image-uploader"]
    COMP --> C_PROD["product-card.tsx"]
    COMP --> C_FOOT["site-footer.tsx"]
    COMP --> C_TESTI["testimonial-cards.tsx"]
    COMP --> C_INSTA["instagram-gallery.tsx"]
    COMP --> C_NEWS["newsletter-form.tsx"]
    COMP --> C_SECTION["section-heading.tsx"]
    COMP --> C_WA["floating-whatsapp.tsx"]

    FEAT --> F_SHOP["shop/<br/>shop-grid, product-detail-client"]
    FEAT --> F_CART["cart/cart-client.tsx"]
    FEAT --> F_CONTACT["contact/contact-form.tsx"]
    FEAT --> F_ADMIN["admin/"]
    F_ADMIN --> FA_PROD["products/<br/>dialogs, table, utils, types"]
    F_ADMIN --> FA_CATS["categories/<br/>table, dialog, actions, utils"]
    F_ADMIN --> FA_ORD["orders/<br/>table, filters, actions"]
    F_ADMIN --> FA_CUST["customers/<br/>table, actions"]
    F_ADMIN --> FA_ENQ["enquiries/<br/>table, filters, actions"]
    F_ADMIN --> FA_MED["media/<br/>grid, toolbar, actions"]
    F_ADMIN --> FA_USERS["users/<br/>actions, types"]
    F_ADMIN --> FA_OVER["admin-overview-client.tsx"]
    F_ADMIN --> FA_FAQ["admin-faq-client.tsx"]
    F_ADMIN --> FA_CONTENT["admin-content-client.tsx"]
    F_ADMIN --> FA_HOME["admin-homepage-client.tsx"]
    F_ADMIN --> FA_SET["admin-settings-client.tsx"]
    F_ADMIN --> FA_ACT["admin-activity-client.tsx"]

    SERV --> S_API["api/<br/>client.ts • endpoints.ts<br/>config.ts • runtime.ts • types.ts"]
    SERV --> S_AUTH["auth/auth.service.ts"]
    SERV --> S_PROD["products/product.service.ts"]
    SERV --> S_CATS["categories/category.service.ts"]
    SERV --> S_ORD["orders/order.service.ts"]
    SERV --> S_ENQ["enquiries/enquiry.service.ts"]
    SERV --> S_FAQ["faq/faq.service.ts"]
    SERV --> S_MED["media/media.service.ts"]
    SERV --> S_USERS["users/user.service.ts"]
    SERV --> S_DASH["dashboard/dashboard.service.ts"]
    SERV --> S_ACT["activity/activity.service.ts"]
    SERV --> S_CONTENT["content/content.service.ts"]
    SERV --> S_CUST["customers/customer.service.ts"]
    SERV --> S_NEWS["notifications/newsletter.service.ts"]
```

---

## 3. Data Request Flow

```mermaid
sequenceDiagram
    participant UI as UI Component<br/>(features/*, app/*)
    participant Hook as Custom Hook<br/>(useQuery / useAdminAuth)
    participant Feature as Feature Action<br/>(features/admin/*-actions)
    participant Service as Domain Service<br/>(services/*.ts)
    participant API as API Client<br/>(services/api/client.ts)
    participant Laravel as Laravel API<br/>(https://api.zurie.co.tz/api/v1)

    alt Storefront Read (Production)
        UI->>Feature: getProducts({category, featured})
        Feature->>Service: productService.listStorefrontProducts(query)
        Service->>API: GET /products?category=&featured=
        API->>Laravel: axios.get (withCredentials)
        Laravel-->>API: 200 {success, data, meta}
        API-->>Service: unwrap data[]
        Service-->>Feature: normalized Product[]
        Feature-->>UI: rendered cards
    end

    alt Admin Create/Update (Mutation)
        UI->>Feature: productActions.create(form)
        Feature->>Service: productService.createProduct(payload)
        Service->>API: POST /products (JSON body)
        API->>API: ensureCsrfCookie()<br/>GET /sanctum/csrf-cookie
        API->>Laravel: POST /products + X-XSRF-TOKEN header
        Laravel-->>API: 201 {success, data:{id}}
        API-->>Service: response
        Service-->>Feature: productId
        Feature->>Service: uploadProductImages(id, files)
        Service->>API: POST /products/{id}/images (FormData)
        Laravel-->>API: 200 {success, data}
        API-->>Feature: success
        Feature-->>UI: update UI state
    end

    alt Checkout Flow
        UI->>Service: orderService.createOrder(payload)
        Service->>API: POST /orders (no prices, IDs+qty only)
        API->>Laravel: POST /orders
        Laravel-->>API: 201 {orderNumber, totalAmount, items}
        API-->>Service: OrderResponse
        Service-->>UI: success → open WhatsApp/Email/SMS
    end

    alt Admin Auth
        UI->>Hook: useAdminAuth()
        Hook->>Service: authService.getCurrentUser()
        Service->>API: GET /auth/user (withCredentials)
        Laravel-->>API: 401/200 {user, roles, permissions}
        API--->>Hook: AuthUser | null
        Hook-->>UI: redirect to /admin/login if no user
    end
```

---

## 4. Storefront Module Flow

```mermaid
flowchart TB
    subgraph Storefront["🛍️ Storefront (public pages)"]
        Home["Home Page<br/>app/(public)/page.tsx"]
        Shop["Shop Grid<br/>features/shop/shop-grid.tsx"]
        Detail["Product Detail<br/>features/shop/product-detail-client.tsx"]
        Cart["Cart Client<br/>features/cart/cart-client.tsx"]
        Contact["Contact Form<br/>features/contact/contact-form.tsx"]
    end

    subgraph SharedComponents["🧩 Shared Storefront Components"]
        Header["SiteHeader<br/>Nav • Cart Drawer • Search"]
        Card["ProductCard"]
        Footer["SiteFooter"]
        WhatsAppBtn["FloatingWhatsApp"]
        Instagram["InstagramGallery"]
        Newsletter["NewsletterForm"]
        Testimonials["TestimonialCards"]
    end

    subgraph ClientState["📦 Zustand State (hooks/)"]
        ShopStore["use-shop-store<br/>cart: CartItem[]<br/>wishlist: string[]<br/>recentlyViewed: string[]"]
        CurrencyStore["use-currency-store<br/>currency: CurrencyCode<br/>rates: RateMap"]
    end

    subgraph Utils["🔧 Utils"]
        WA["utils/whatsapp.ts<br/>buildWhatsAppCheckoutLink<br/>buildWhatsAppOrderMessage"]
        Curr["utils/currency.ts<br/>formatCurrency<br/>convertFromBaseCurrency"]
    end

    Home --> Card
    Home --> Header
    Home --> Footer
    Home --> Testimonials
    Shop --> Card
    Detail --> Card
    Cart --> ShopStore
    Cart --> CurrencyStore
    Cart --> WA
    Cart --> Curr
    Contact --> Header
    Header --> ShopStore
    ShopStore --> Cart
    WhatsAppBtn --> WA
```

---

## 5. Admin Dashboard Module Flow

```mermaid
flowchart TB
    subgraph AdminAuth["🔐 Admin Auth Guard"]
        Login["/admin/login"]
        Guard["AdminAuthGuard<br/>use-admin-auth.ts"]
        Shell["AdminShell<br/>Drawer • Breadcrumbs • Theme"]
    end

    subgraph AdminModules["📊 Admin Modules"]
        Overview["/admin — Overview<br/>admin-overview-client.tsx"]
        Products["/admin/products<br/>admin-products-client.tsx"]
        Categories["/admin/categories<br/>categories-table + form-dialog"]
        Orders["/admin/orders<br/>orders-table + filters"]
        Customers["/admin/customers<br/>customers-table"]
        Users["/admin/users<br/>admin-users-client"]
        Media["/admin/media<br/>media-grid + toolbar"]
        Enquiries["/admin/enquiries<br/>enquiries-table"]
        Faq["/admin/faq<br/>admin-faq-client"]
        Activity["/admin/activity<br/>admin-activity-client"]
        Content["/admin/content<br/>admin-content-client"]
        Homepage["/admin/homepage<br/>admin-homepage-client"]
        Settings["/admin/settings<br/>admin-settings-client"]
    end

    subgraph FeatureActions["🎯 Feature Actions (features/admin/)"]
        ProdActions["product-actions.ts<br/>list • create • update<br/>delete • duplicate • uploadImages"]
        CatActions["category-actions.ts<br/>create • update • delete"]
        OrdActions["order-actions.ts<br/>list • updateStatus • cancel"]
        CustActions["customer-actions.ts"]
        EnqActions["enquiry-actions.ts"]
        MediaActions["media-actions.ts<br/>upload • remove"]
        UserActions["user-actions.ts<br/>createUser • updateRole<br/>syncRolePermissions"]
    end

    subgraph DashboardService["📈 dashboard.service.ts"]
        GetOverview["getOverview()<br/>GET /admin/dashboard-overview"]
    end

    Login --> Guard
    Guard --> Shell
    Shell --> Overview
    Shell --> Products
    Shell --> Categories
    Shell --> Orders
    Shell --> Customers
    Shell --> Users
    Shell --> Media
    Shell --> Enquiries
    Shell --> Faq
    Shell --> Activity
    Shell --> Content
    Shell --> Homepage
    Shell --> Settings

    Products --> ProdActions
    Categories --> CatActions
    Orders --> OrdActions
    Customers --> CustActions
    Enquiries --> EnqActions
    Media --> MediaActions
    Users --> UserActions
    Faq --> FaqActions
    Activity --> ActivityActions
    Overview --> GetOverview
    Overview --> ProdActions
    Overview --> OrdActions
    Overview --> CustActions
```

---

## 6. Authentication Flow

```mermaid
sequenceDiagram
    participant User as Browser User
    participant Page as Login Page<br/>(app/(auth)/admin/login)
    participant AuthSvc as auth.service.ts
    participant API as api/client.ts
    participant Laravel as Laravel API

    User->>Page: Enter email + password
    Page->>AuthSvc: authService.login(email, password)
    AuthSvc->>API: POST /auth/login

    Note over API, Laravel: CSRF Bootstrap (First mutation)
    API->>Laravel: GET /sanctum/csrf-cookie
    Laravel-->>API: Set XSRF-TOKEN cookie

    API->>Laravel: POST /auth/login<br/>+ X-XSRF-TOKEN header
    Laravel-->>API: 200 {user, roles, permissions}
    AuthSvc-->>Page: saveSession(localStorage)<br/>return user

    Page->>User: Redirect to /admin

    Note over User, Laravel: Session Restore (App Load)
    User->>Page: Navigate to /admin/*
    Page->>AuthSvc: getCurrentUser()
    AuthSvc->>API: GET /auth/user
    Laravel-->>API: 200 {user, roles, permissions}
    AuthSvc-->>Page: AuthUser | null
    Page-->>User: Redirect to /admin/login if null
```

---

## 7. Service ↔ API Endpoint Mapping

```mermaid
flowchart LR
    subgraph Services["Services Layer"]
        direction TB
        Auth["auth.service.ts"]
        Prod["product.service.ts"]
        Cat["category.service.ts"]
        Ord["order.service.ts"]
        Enq["enquiry.service.ts"]
        FAQ["faq.service.ts"]
        Med["media.service.ts"]
        User["user.service.ts"]
        Dash["dashboard.service.ts"]
        Act["activity.service.ts"]
        Content["content.service.ts"]
        Cust["customer.service.ts"]
        News["newsletter.service.ts"]
    end

    subgraph Endpoints["API Endpoints (endpoints.ts)"]
        direction TB
        E_Auth["POST /auth/login<br/>GET /auth/user<br/>POST /auth/logout<br/>POST /auth/forgot-password<br/>POST /auth/reset-password<br/>GET /sanctum/csrf-cookie"]
        E_Prod["GET /products<br/>GET /products/{slug}<br/>GET /admin/products<br/>GET/PATCH /products/{id}<br/>POST /products<br/>POST /products/{id}/duplicate<br/>POST /products/{id}/images<br/>GET/PATCH /products/{id}/inventory"]
        E_Cat["GET /categories<br/>GET /admin/categories<br/>POST /categories<br/>PATCH /categories/{id}<br/>POST /categories/{id}/image"]
        E_Ord["POST /orders<br/>GET /admin/orders<br/>GET /admin/orders/{orderNumber}<br/>PATCH /admin/orders/{orderNumber}<br/>POST /admin/orders/{orderNumber}/cancel"]
        E_Enq["POST /contact<br/>GET /admin/enquiries<br/>PATCH /admin/enquiries/{id}"]
        E_FAQ["GET /faq<br/>POST /admin/faq<br/>PATCH /admin/faq/{id}<br/>DELETE /admin/faq/{id}"]
        E_Med["POST /media/upload<br/>GET /media<br/>DELETE /media/{id}"]
        E_User["GET /admin/users<br/>PATCH /admin/users/{id}<br/>POST /users<br/>POST /users/{id}/roles<br/>GET /admin/roles<br/>GET /admin/permissions<br/>POST /roles<br/>POST /roles/{id}/permissions"]
        E_Dash["GET /admin/dashboard-overview"]
        E_Act["GET /admin/activity"]
        E_Content["GET/PUT /admin/settings/brand-content<br/>GET/PUT /admin/settings/contact-info<br/>GET/PUT /admin/settings/homepage"]
        E_Cust["GET /admin/customers"]
        E_News["POST /newsletter"]
    end

    Auth --> E_Auth
    Prod --> E_Prod
    Cat --> E_Cat
    Ord --> E_Ord
    Enq --> E_Enq
    FAQ --> E_FAQ
    Med --> E_Med
    User --> E_User
    Dash --> E_Dash
    Act --> E_Act
    Content --> E_Content
    Cust --> E_Cust
    News --> E_News
```

---

## 8. Theme & Styling Architecture

```mermaid
flowchart TB
    subgraph ThemeSystem["🎨 Theme System"]
        ThemeProvider["theme-provider.tsx<br/>AppThemeProvider"]
        Fonts["next/font<br/>Manrope + Playfair Display"]
        MUI["@mui/material<br/>MUI 7 + Emotion"]
        FontAwesome["@fortawesome<br/>Free Solid/Brands/Regular"]
        Globals["globals.css<br/>Marquee animation<br/>Custom styles"]
    end

    subgraph Providers["📦 Provider Stack"]
        AppRouterCache["AppRouterCacheProvider<br/>(MUI Next.js)"]
        QueryProvider["QueryProvider<br/>(TanStack React Query)"]
        ThemeProvider
    end

    subgraph AppRoot["app/layout.tsx"]
        RootLayout["RootLayout"]
        Html["<html lang='en'>"]
        Body["<body>"]
    end

    AppRoot --> Providers
    AppRouterCache --> QueryProvider --> ThemeProvider
    ThemeProvider --> Fonts
    ThemeProvider --> MUI
    ThemeProvider --> Globals

    subgraph ThemeModes["🌓 Light / Dark Mode"]
        Palette["palette:<br/>light: #f8f5f0 bg<br/>dark: #12110f bg"]
        Primary["primary:<br/>#b58a57 (light)<br/>#d6b487 (dark)"]
        Typography["typography:<br/>Manrope (body)<br/>Playfair Display (headings)"]
    end

    ThemeProvider --> ThemeModes
```

---

## 9. Key Type Script Types

```mermaid
flowchart LR
    subgraph DomainTypes["types/domain.ts"]
        T_Product["Product<br/>id, name, slug, price<br/>salePrice, status, categorySlug<br/>images[], colors[], sizes[]"]
        T_Order["Order<br/>orderNumber, customerName<br/>totalAmount, status, items[]"]
        T_Enquiry["Enquiry<br/>name, email, phone, message"]
        T_AdminUser["AdminUser<br/>fullName, email, role"]
        T_MediaItem["MediaItem<br/>fileName, fileUrl, mimeType"]
        T_Category["Category<br/>name, slug, imageUrl, visible"]
        T_AuthUser["AuthUser<br/>id, name, email, role<br/>permissions[]"]
        T_Dashboard["DashboardOverview<br/>totalProducts, productsInStock<br/>newOrders"]
    end

    subgraph FeatureTypes["features/**/types.ts"]
        FT_AdminProduct["AdminProduct<br/>+ buyingPrice, stockStatus<br/>+ imageUrls, images, quantity"]
        FT_ProductForm["ProductFormState<br/>form field state for create/edit"]
        FT_OrderRow["AdminOrderRow<br/>order_number, customer_name<br/>total_amount, status"]
        FT_User["UserRole, AdminUserRow<br/>Role, Permission"]
    end

    subgraph ProductTypes["types/product.ts"]
        PT_Product["Product (storefront)<br/>category objects<br/>categoryLabel"]
        PT_CartItem["CartItem<br/>productId, product, quantity"]
    end

    FT_AdminProduct --> T_Product
    PT_Product --> T_Product
    FT_User --> T_AdminUser
```

---

## Usage

This chart is intended as a living document. Update it as the repository evolves.

- **Section 1** — Overall architecture for onboarding / big picture understanding
- **Section 2** — Directory reference quick-lookup
- **Section 3** — Debugging data flow issues
- **Section 4** — Storefront development
- **Section 5** — Admin module development
- **Section 6** — Auth & session troubleshooting
- **Section 7** — Service/API reference
- **Section 8** — Styling and theming
- **Section 9** — Type relationships

> Built for the **Zuriè** repository — Next.js 15, TypeScript strict, Material UI 7, Zustand, TanStack Query, Font Awesome.
