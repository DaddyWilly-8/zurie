export const API_ENDPOINTS = {
  auth: {
    csrfCookie: "/sanctum/csrf-cookie",
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    currentUser: "/auth/user",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    // Plain browser navigations (<a href>, never apiClient) — see
    // AuthController::redirectToGoogle()'s docblock on the backend for why.
    googleRedirect: "/auth/google/redirect",
  },
  account: {
    profile: "/account/profile",
    orders: "/account/orders",
  },
  products: {
    list: "/products",
    adminList: "/admin/products",
    adminById: (id: string) => `/admin/products/${id}`,
    byId: (id: string) => `/products/${id}`,
    bySlug: (slug: string) => `/products/${slug}`,
    duplicate: (id: string) => `/products/${id}/duplicate`,
    inventory: (id: string) => `/products/${id}/inventory`,
    images: (id: string) => `/products/${id}/images`,
    imageById: (id: string, imageId: string) =>
      `/products/${id}/images/${imageId}`,
  },
  categories: {
    list: "/categories",
    adminList: "/admin/categories",
    byId: (id: string) => `/categories/${id}`,
    image: (id: string) => `/categories/${id}/image`,
  },
  orders: {
    // Public checkout
    list: "/orders",

    // Admin routes with /admin/ prefix
    adminList: "/admin/orders",
    adminByOrderNumber: (orderNumber: string) => `/admin/orders/${orderNumber}`,
    adminCancel: (orderNumber: string) => `/admin/orders/${orderNumber}/cancel`,
    adminReceipts: (orderNumber: string) =>
      `/admin/orders/${orderNumber}/receipts`,
    adminDeliveries: (orderNumber: string) =>
      `/admin/orders/${orderNumber}/deliveries`,
    adminUndispatchedItems: (orderNumber: string) =>
      `/admin/orders/${orderNumber}/undispatched-items`,

    // Backward compatibility (deprecated - use adminByOrderNumber)
    byId: (id: string) => `/orders/${id}`,
    byOrderNumber: (orderNumber: string) => `/orders/${orderNumber}`,
    cancel: (orderNumber: string) => `/orders/${orderNumber}/cancel`,
  },
  enquiries: {
    list: "/enquiries",
    adminList: "/admin/enquiries",
    byId: (id: string) => `/enquiries/${id}`,
    adminById: (id: string) => `/admin/enquiries/${id}`,
  },
  faq: {
    list: "/faq",
    adminList: "/admin/faq",
    byId: (id: string) => `/faq/${id}`,
    adminById: (id: string) => `/admin/faq/${id}`,
  },
  settings: {
    public: "/settings",
    brand: "/admin/settings/brand",
    brandLogo: "/admin/settings/brand/logo",
    contact: "/admin/settings/contact",
    homepage: "/admin/settings/homepage",
    homepageHeroImage: "/admin/settings/homepage/hero-image",
    policies: "/admin/settings/policies",
    dashboardOverview: "/admin/dashboard-overview",
  },
  media: {
    list: "/media",
    adminList: "/admin/media",
    byId: (id: string) => `/media/${id}`,
    upload: "/media/upload",
  },
  users: {
    create: "/users",
    attachRole: (id: string) => `/users/${id}/roles`,
  },
  adminRoles: {
    list: "/admin/roles",
    byId: (id: string) => `/admin/roles/${id}`,
  },
  adminPermissions: {
    list: "/admin/permissions",
  },
  roles: {
    create: "/roles",
    attachPermission: (id: string) => `/roles/${id}/permissions`,
  },
  adminUsers: {
    list: "/admin/users",
    byId: (id: string) => `/admin/users/${id}`,
  },
  activity: {
    list: "/admin/activity",
  },
  customers: {
    list: "/admin/customers",
    byId: (id: string) => `/admin/customers/${id}`,
  },
  costCenters: {
    list: "/admin/finance/cost-centers",
    byId: (id: number) => `/admin/finance/cost-centers/${id}`,
  },
  finance: {
    chartOfAccounts: "/admin/finance/chart-of-accounts",
    ledgerGroups: "/admin/finance/ledger-groups",
    ledgerGroupById: (id: number) => `/admin/finance/ledger-groups/${id}`,
    ledgers: "/admin/finance/ledgers",
    ledgerById: (id: number) => `/admin/finance/ledgers/${id}`,
  },
  outlets: {
    list: "/admin/outlets",
    byId: (id: number) => `/admin/outlets/${id}`,
  },
  suppliers: {
    list: "/admin/suppliers",
    byId: (id: string | number) => `/admin/suppliers/${id}`,
  },
  priceLists: {
    list: "/admin/price-lists",
    byId: (id: number) => `/admin/price-lists/${id}`,
    items: (id: number) => `/admin/price-lists/${id}/items`,
    itemByProduct: (id: number, productId: number) =>
      `/admin/price-lists/${id}/items/${productId}`,
  },
  purchases: {
    list: "/admin/purchases",
    byNumber: (purchaseNumber: string) => `/admin/purchases/${purchaseNumber}`,
  },
  pos: {
    sale: "/admin/pos/sale",
  },
  measurementUnits: {
    list: "/admin/measurement-units",
    byId: (id: number) => `/admin/measurement-units/${id}`,
  },
  currencies: {
    list: "/admin/currencies",
    byId: (id: number) => `/admin/currencies/${id}`,
    designateBase: (id: number) => `/admin/currencies/${id}/designate-base`,
    exchangeRates: (id: number) => `/admin/currencies/${id}/exchange-rates`,
  },
  cashierSessions: {
    list: "/admin/cashier-sessions",
    current: "/admin/cashier-sessions/current",
    open: "/admin/cashier-sessions/open",
    close: (id: number) => `/admin/cashier-sessions/${id}/close`,
  },
  stakeholders: {
    list: "/admin/stakeholders",
    byId: (id: number) => `/admin/stakeholders/${id}`,
  },
  purchaseOrders: {
    list: "/admin/purchase-orders",
    byId: (id: number) => `/admin/purchase-orders/${id}`,
    close: (id: number) => `/admin/purchase-orders/${id}/close`,
    reopen: (id: number) => `/admin/purchase-orders/${id}/reopen`,
    cancel: (id: number) => `/admin/purchase-orders/${id}/cancel`,
    payments: (id: number) => `/admin/purchase-orders/${id}/payments`,
  },
  grns: {
    list: "/admin/grns",
    byId: (id: number) => `/admin/grns/${id}`,
  },
  inventoryTransfers: {
    list: "/admin/inventory-transfers",
    byId: (id: number) => `/admin/inventory-transfers/${id}`,
  },
  vatTransactions: {
    list: "/admin/vat-transactions",
    summary: "/admin/vat-transactions/summary",
  },
  proformaInvoices: {
    list: "/admin/proforma-invoices",
    byId: (id: number) => `/admin/proforma-invoices/${id}`,
    active: (id: number) => `/admin/proforma-invoices/${id}/active`,
  },
  payments: {
    list: "/admin/payments",
    byId: (id: number) => `/admin/payments/${id}`,
  },
  receipts: {
    list: "/admin/receipts",
    byId: (id: number) => `/admin/receipts/${id}`,
  },
  journalVouchers: {
    list: "/admin/journal-vouchers",
    byId: (id: number) => `/admin/journal-vouchers/${id}`,
  },
  fundTransfers: {
    list: "/admin/fund-transfers",
    byId: (id: number) => `/admin/fund-transfers/${id}`,
  },
  reports: {
    salesByChannel: "/admin/reports/sales-by-channel",
    lowStock: "/admin/reports/low-stock",
    revenueSummary: "/admin/reports/revenue-summary",
    balanceSheet: "/admin/reports/balance-sheet",
    trialBalance: "/admin/reports/trial-balance",
    inventoryValue: "/admin/reports/inventory-value",
    debtors: "/admin/reports/debtors",
    creditors: "/admin/reports/creditors",
    purchaseSummary: "/admin/reports/purchase-summary",
    storeStock: (outletId: number) => `/admin/reports/store-stock/${outletId}`,
  },
  whatsappCheckout: "/checkout/whatsapp",
  contact: "/contact",
  newsletter: "/newsletter",
} as const;
