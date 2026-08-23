export type EntityId = string;

export type AdminRole = "super_admin" | "admin" | "staff";

export type ProductStatus = "draft" | "published" | "archived";

export type OrderStatus =
  | "new"
  | "confirmed"
  | "processing"
  | "ready_for_delivery"
  | "delivered"
  | "cancelled";

export type EnquiryStatus = "new" | "read" | "responded" | "archived";

export type ApiListResponse<T> = {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
};

export type ProductImageAsset = {
  id: EntityId;
  url: string;
  altText: string;
  isPrimary: boolean;
};

export type Category = {
  id: EntityId;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  visible: boolean;
  sortOrder: number;
};

export type Product = {
  id: EntityId;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice: number | null;
  sku: string;
  status: ProductStatus;
  categorySlug: string;
  categoryName: string;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  inStock: boolean;
  stockCount: number;
  material: string;
  colors: Array<{ name: string; hex: string }>;
  sizes: string[];
  specifications: string[];
  seoTitle: string;
  seoDescription: string;
  images: ProductImageAsset[];
  createdAt: string;
  updatedAt: string;
};

export type ProductPayload = Omit<
  Product,
  "id" | "categoryName" | "createdAt" | "updatedAt"
>;

export type OrderItem = {
  id: EntityId;
  productId: EntityId;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type Order = {
  id: EntityId;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  whatsappNumber: string;
  totalAmount: number;
  status: OrderStatus;
  notes: string;
  createdAt: string;
  items: OrderItem[];
};

export type Enquiry = {
  id: EntityId;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
};

export type AdminUser = {
  id: EntityId;
  fullName: string;
  email: string;
  role: AdminRole;
  createdAt: string;
};

export type MediaItem = {
  id: EntityId;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  folder: string;
  createdAt: string;
};

export type HomepageSettings = {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroButtonText: string;
  heroButtonLink: string;
  heroImage: string;
  heroActive: boolean;
  bannerTitle: string;
  bannerDescription: string;
  bannerImage: string;
  bannerCtaText: string;
  bannerCtaLink: string;
  bannerActive: boolean;
  featuredProductIds: string[];
  newArrivalProductIds: string[];
};

export type SiteSettings = {
  whatsappNumber: string;
  phone: string;
  email: string;
  address: string;
  mapEmbedUrl: string;
  instagram: string;
  facebook: string;
  tiktok: string;
};

export type BrandContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  story: string;
  mission: string;
  vision: string;
  qualityCommitment: string;
};

export type DashboardOverview = {
  totalProducts: number;
  productsInStock: number;
  productsOutOfStock: number;
  totalCategories: number;
  completedOrders: number;
  newOrders: number;
  lowStockProducts: Array<{ id: string; name: string; stock_count: number }>;
  recentProducts: Array<{ id: string; name: string; stock_count: number }>;
};

export type AuthUser = {
  id: EntityId;
  name: string;
  email: string;
  role: AdminRole;
  permissions?: string[];
};

export type AuthSession = {
  user: AuthUser;
  authenticatedAt: string;
};
