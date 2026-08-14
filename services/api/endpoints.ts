// services/api/endpoints.ts
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
    brand: "/admin/settings/brand-content",
    contact: "/admin/settings/contact-info",
    homepage: "/admin/settings/homepage",
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
  },
  adminPermissions: {
    list: "/admin/permissions",
  },
  roles: {
    create: "/roles",
    attachPermission: (id: string) => `/roles/${id}/permissions`,
    updatePermissions: (id: string) => `/roles/${id}/permissions`,
    detachPermission: (id: string, permissionId: string) =>
      `/roles/${id}/permissions/${permissionId}`,
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
  whatsappCheckout: "/checkout/whatsapp",
  contact: "/contact",
  newsletter: "/newsletter",
} as const;
