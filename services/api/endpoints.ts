export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    currentUser: "/auth/user",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  products: {
    list: "/products",
    byId: (id: string) => `/products/${id}`,
    bySlug: (slug: string) => `/products/${slug}`,
    duplicate: (id: string) => `/products/${id}/duplicate`,
  },
  categories: {
    list: "/categories",
    byId: (id: string) => `/categories/${id}`,
  },
  orders: {
    list: "/orders",
    byId: (id: string) => `/orders/${id}`,
  },
  enquiries: {
    list: "/enquiries",
    byId: (id: string) => `/enquiries/${id}`,
  },
  settings: {
    brand: "/settings/brand-content",
    contact: "/settings/contact-info",
    homepage: "/settings/homepage",
    dashboardOverview: "/settings/dashboard-overview",
  },
  media: {
    list: "/media",
    byId: (id: string) => `/media/${id}`,
    upload: "/media/upload",
  },
  adminUsers: {
    list: "/admin/users",
    byId: (id: string) => `/admin/users/${id}`,
  },
  whatsappCheckout: "/checkout/whatsapp",
  contact: "/contact",
  newsletter: "/newsletter",
} as const;
