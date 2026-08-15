// services/dashboard/dashboard.service.ts
import { apiClient } from "@/services/api/client";
import { API_ENDPOINTS } from "@/services/api/endpoints";

// Product type from API
export type ApiProduct = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  categoryId: number;
  sku: string | null;
  buyingPrice: number;
  price: number;
  salePrice: number;
  material: string | null;
  specifications: string[];
  status: "published" | "draft" | "archived";
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  colors: string[];
  sizes: string[];
  imageUrls: string[];
  images: Array<{
    id: number;
    url: string;
    sortOrder: number;
  }>;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK";
  quantity: number;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
};

// Order type from API
export type ApiOrder = {
  id: number;
  orderNumber: string;
  status:
    | "new"
    | "confirmed"
    | "processing"
    | "ready_for_delivery"
    | "delivered"
    | "cancelled";
  customerName: string;
  customerPhone: string;
  whatsappNumber: string | null;
  totalAmount: number;
  createdAt: string;
};

// Customer type from API
export type ApiCustomer = {
  id: number;
  name: string;
  phone: string;
  whatsappNumber: string | null;
  email: string | null;
  createdAt: string;
};

// Updated DashboardOverview type matching API response
export type DashboardOverview = {
  totalProducts: number;
  productsInStock: number;
  productsOutOfStock: number;
  totalCategories: number;
  newOrders: number;
  recentOrders: ApiOrder[];
  recentProducts: ApiProduct[];
  recentCustomers: ApiCustomer[];
};

// For backward compatibility with existing code that might expect lowStockProducts
export type LegacyDashboardOverview = DashboardOverview & {
  completedOrders: number;
  lowStockProducts: Array<{ id: string; name: string; stock_count: number }>;
};

type ApiResponse = {
  success: boolean;
  data: DashboardOverview;
};

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const response = await apiClient.get<ApiResponse>(
      API_ENDPOINTS.settings.dashboardOverview,
    );

    if (
      response &&
      typeof response === "object" &&
      "data" in response &&
      response.data
    ) {
      return response.data;
    }

    return response as unknown as DashboardOverview;
  },
};
