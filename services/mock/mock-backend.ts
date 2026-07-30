import {
  addEnquiryState,
  createCategoryState,
  createProductState,
  deleteCategoryState,
  deleteProductState,
  findProductBySlugState,
  getBrandContentState,
  getContactInfoState,
  listAdminProductsState,
  listCategoriesState,
  listEnquiriesState,
  listProductsByCategoryState,
  listProductsState,
  updateBrandContentState,
  updateCategoryState,
  updateContactInfoState,
  updateProductState,
  upsertNewsletterState,
} from "@/lib/local-data";
import type { BrandContent, ContactInfo } from "@/types/content";

const nowIso = () => new Date().toISOString();

const createId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

type MockOrderStatus =
  | "new"
  | "confirmed"
  | "processing"
  | "ready_for_delivery"
  | "delivered"
  | "cancelled";

type MockEnquiryStatus = "new" | "read" | "responded" | "archived";

type MockOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  whatsapp_number: string;
  total_amount: number;
  status: MockOrderStatus;
  notes: string | null;
  created_at: string;
};

type MockMedia = {
  id: string;
  file_name: string;
  file_url: string;
  mime_type: string;
  size_bytes: number;
  folder: string;
  created_at: string;
};

type MockUser = {
  id: string;
  full_name: string;
  role: "super_admin" | "admin" | "staff";
  created_at: string;
};

type MockActivity = {
  id: string;
  user_id: string | null;
  action: string;
  resource: string;
  created_at: string;
};

const orders: MockOrder[] = [];
const media: MockMedia[] = [];
const users: MockUser[] = [
  {
    id: "admin_local_1",
    full_name: "Local Admin",
    role: "super_admin",
    created_at: nowIso(),
  },
];
const activities: MockActivity[] = [];
const homepage = {
  heroTitle: "Carry Confidence. Wear Elegance.",
  heroSubtitle: "The Atelier Collection",
  heroDescription: "The architecture of elegance, handcrafted for the modern woman.",
  heroButtonText: "Discover The Collection",
  heroButtonLink: "/shop",
  heroImage: "/images/hero/zurie-hero.png",
  heroActive: true,
  bannerTitle: "New Season Drop",
  bannerDescription: "Limited editions now available.",
  bannerImage: "",
  bannerCtaText: "Learn More",
  bannerCtaLink: "/shop",
  bannerActive: false,
  featuredProductIds: [] as string[],
  newArrivalProductIds: [] as string[],
};

const log = (action: string, resource: string, userId: string | null = "admin_local_1") => {
  activities.unshift({
    id: createId("act"),
    user_id: userId,
    action,
    resource,
    created_at: nowIso(),
  });
};

const toPaged = <T>(rows: T[], page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    data: rows.slice(start, end),
    count: rows.length,
    page,
    pageSize,
  };
};

export const mockBackend = {
  auth: {
    async login(email: string, password: string) {
      const validEmail = process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL ?? "admin@zurie.local";
      const validPassword = process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD ?? "admin12345";

      if (email !== validEmail || password !== validPassword) {
        throw new Error("Invalid credentials");
      }

      return {
        token: "mock-session-token",
        user: {
          id: "admin_local_1",
          name: "Local Admin",
          email,
          role: "super_admin" as const,
        },
      };
    },

    async getCurrentUser() {
      return {
        id: "admin_local_1",
        name: "Local Admin",
        email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL ?? "admin@zurie.local",
        role: "super_admin" as const,
      };
    },
  },

  storefront: {
    async listProducts() {
      return listProductsState();
    },
    async listProductsByCategory(category: string) {
      return listProductsByCategoryState(category);
    },
    async findProductBySlug(slug: string) {
      return findProductBySlugState(slug);
    },
  },

  categories: {
    async list() {
      return listCategoriesState();
    },

    async create(payload: { name: string; slug: string }) {
      const ok = createCategoryState(payload);
      if (!ok) throw new Error("Category already exists");
      log("category.created", "categories");
      return { success: true };
    },

    async update(id: string, payload: { name?: string; slug?: string }) {
      const ok = updateCategoryState(id, payload);
      if (!ok) throw new Error("Category not found");
      log("category.updated", "categories");
      return { success: true };
    },

    async remove(id: string) {
      const ok = deleteCategoryState(id);
      if (!ok) throw new Error("Category not found");
      log("category.deleted", "categories");
      return { success: true };
    },
  },

  products: {
    async listAdmin() {
      return listAdminProductsState();
    },

    async create(payload: {
      name: string;
      slug: string;
      description: string;
      price: number;
      category: string;
      featured: boolean;
      bestSeller: boolean;
      newArrival: boolean;
      inStock: boolean;
      stockCount: number;
      colors: Array<{ name: string; hex: string }>;
      sizes: string[];
      specifications: string[];
      imageUrls: string[];
    }) {
      const id = createProductState(payload);
      log("product.created", "products");
      return { id };
    },

    async update(id: string, payload: {
      name: string;
      slug: string;
      description: string;
      price: number;
      category: string;
      featured: boolean;
      bestSeller: boolean;
      newArrival: boolean;
      inStock: boolean;
      stockCount: number;
      colors: Array<{ name: string; hex: string }>;
      sizes: string[];
      specifications: string[];
      imageUrls: string[];
    }) {
      const ok = updateProductState(id, payload);
      if (!ok) throw new Error("Product not found");
      log("product.updated", "products");
      return { success: true };
    },

    async remove(id: string) {
      const ok = deleteProductState(id);
      if (!ok) throw new Error("Product not found");
      log("product.deleted", "products");
      return { success: true };
    },

    async duplicate(id: string) {
      const product = listAdminProductsState().find((item) => item.id === id);
      if (!product) throw new Error("Product not found");

      const newId = createProductState({
        name: `${product.name} (Copy)`,
        slug: `${product.slug}-copy-${Date.now()}`,
        description: product.description,
        price: product.price,
        category: product.category,
        featured: false,
        bestSeller: false,
        newArrival: false,
        inStock: product.in_stock,
        stockCount: product.stock_count,
        colors: product.colors,
        sizes: product.sizes,
        specifications: product.specifications,
        imageUrls: product.product_images.map((image) => image.url),
      });
      log("product.duplicated", "products");
      return { id: newId };
    },
  },

  orders: {
    async list(params: { page: number; pageSize: number; search?: string; status?: string }) {
      const filtered = orders.filter((item) => {
        const searchOk = !params.search
          ? true
          : `${item.order_number} ${item.customer_name} ${item.customer_phone}`
              .toLowerCase()
              .includes(params.search.toLowerCase());
        const statusOk = !params.status ? true : item.status === params.status;
        return searchOk && statusOk;
      });
      return toPaged(filtered, params.page, params.pageSize);
    },

    async updateStatus(id: string, status: MockOrderStatus) {
      const index = orders.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("Order not found");
      orders[index].status = status;
      log("order.status_updated", "orders");
      return { success: true };
    },

    async createFromWhatsApp(payload: {
      customerName: string;
      customerPhone?: string;
      whatsappNumber: string;
      total: number;
      items: Array<{ quantity: number; product: { name: string; price: number } }>;
    }) {
      const orderId = createId("ord");
      orders.unshift({
        id: orderId,
        order_number: `ZR-${Date.now()}`,
        customer_name: payload.customerName,
        customer_phone: payload.customerPhone ?? "",
        whatsapp_number: payload.whatsappNumber,
        total_amount: payload.total,
        status: "new",
        notes: null,
        created_at: nowIso(),
      });
      log("order.created", "orders");
      return { id: orderId };
    },
  },

  enquiries: {
    async list(params: { page: number; pageSize: number; search?: string; status?: string }) {
      const enriched = listEnquiriesState().map((item) => ({
        ...item,
        phone: "",
        status: "new" as MockEnquiryStatus,
      }));

      const filtered = enriched.filter((item) => {
        const searchOk = !params.search
          ? true
          : `${item.name} ${item.email}`.toLowerCase().includes(params.search.toLowerCase());
        const statusOk = !params.status ? true : item.status === params.status;
        return searchOk && statusOk;
      });
      return toPaged(filtered, params.page, params.pageSize);
    },

    async create(payload: { name: string; email: string; message: string }) {
      addEnquiryState(payload);
      log("enquiry.created", "enquiries", null);
      return { success: true };
    },
  },

  content: {
    async getBrandContent() {
      return getBrandContentState();
    },

    async updateBrandContent(payload: Partial<BrandContent>) {
      updateBrandContentState(payload);
      log("content.updated", "brand_content");
      return { success: true };
    },

    async getContactInfo() {
      return getContactInfoState();
    },

    async updateContactInfo(payload: Partial<ContactInfo>) {
      updateContactInfoState(payload);
      log("settings.updated", "contact_info");
      return { success: true };
    },

    async getHomepage() {
      return homepage;
    },

    async updateHomepage(payload: Record<string, unknown>) {
      Object.assign(homepage, payload);
      log("homepage.updated", "homepage_sections");
      return { success: true };
    },
  },

  dashboard: {
    async getOverview() {
      const adminProducts = listAdminProductsState();
      const categories = listCategoriesState();
      const enquiries = listEnquiriesState();

      return {
        totalProducts: adminProducts.length,
        activeProducts: adminProducts.filter((item) => item.in_stock).length,
        outOfStockProducts: adminProducts.filter((item) => !item.in_stock).length,
        totalCategories: categories.length,
        pendingOrders: orders.filter((item) => item.status === "new").length,
        completedOrders: orders.filter((item) => item.status === "delivered").length,
        enquiries: enquiries.length,
        lowStockProducts: adminProducts
          .filter((item) => item.stock_count <= 5)
          .slice(0, 5)
          .map((item) => ({ id: item.id, name: item.name, stock_count: item.stock_count })),
        recentProducts: adminProducts
          .slice(0, 5)
          .map((item) => ({ id: item.id, name: item.name, stock_count: item.stock_count })),
        recentOrders: orders
          .slice(0, 5)
          .map((item) => ({ id: item.id, order_number: item.order_number, status: item.status })),
        recentEnquiries: enquiries.slice(0, 5).map((item) => ({
          id: item.id,
          name: item.name,
          status: "new",
        })),
      };
    },
  },

  media: {
    async list(params: { page: number; pageSize: number; search?: string }) {
      const filtered = media.filter((item) =>
        params.search
          ? item.file_name.toLowerCase().includes(params.search.toLowerCase())
          : true,
      );
      return toPaged(filtered, params.page, params.pageSize);
    },

    async upload(file: File, folder: string) {
      const id = createId("med");
      const fileUrl = URL.createObjectURL(file);
      media.unshift({
        id,
        file_name: file.name,
        file_url: fileUrl,
        mime_type: file.type,
        size_bytes: file.size,
        folder,
        created_at: nowIso(),
      });
      log("media.uploaded", "media");
      return { id, url: fileUrl };
    },

    async remove(id: string) {
      const before = media.length;
      const next = media.filter((item) => item.id !== id);
      if (next.length === before) throw new Error("Media not found");
      media.length = 0;
      media.push(...next);
      log("media.deleted", "media");
      return { success: true };
    },
  },

  users: {
    async list() {
      return users;
    },

    async updateRole(id: string, role: "super_admin" | "admin" | "staff") {
      const index = users.findIndex((user) => user.id === id);
      if (index < 0) throw new Error("User not found");
      users[index].role = role;
      log("admin_user.role_updated", "profiles");
      return { success: true };
    },
  },

  activity: {
    async list(page: number, pageSize: number) {
      return toPaged(activities, page, pageSize);
    },
  },

  notifications: {
    async newsletter(email: string) {
      upsertNewsletterState(email);
      return { success: true };
    },
  },
};
