export const API_ENDPOINTS = {
  auth: {
    csrfCookie: "/sanctum/csrf-cookie",
    login: "/auth/login",
    logout: "/auth/logout",
    currentUser: "/auth/user",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
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
    imageById: (id: string, imageId: string) => `/products/${id}/images/${imageId}`,
  },
  categories: {
    list: "/categories",
    adminList: "/admin/categories",
    byId: (id: string) => `/categories/${id}`,
    image: (id: string) => `/categories/${id}/image`,
  },
  orders: {
    list: "/orders",
    byId: (id: string) => `/orders/${id}`,
  },
  enquiries: {
    list: "/enquiries",
    byId: (id: string) => `/enquiries/${id}`,
  },
  faq: {
    list: "/faq",
    byId: (id: string) => `/faq/${id}`,
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
  users: {
    create: "/users",
    attachRole: (id: string) => `/users/${id}/roles`,
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
    list: "/activity",
  },
  customers: {
    list: "/admin/customers",
    byId: (id: string) => `/admin/customers/${id}`,
  },
  whatsappCheckout: "/checkout/whatsapp",
  contact: "/contact",
  newsletter: "/newsletter",
} as const;
