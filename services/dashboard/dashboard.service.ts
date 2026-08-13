// services/dashboard/dashboard.service.ts
import { apiClient } from "@/services/api/client";
import { API_ENDPOINTS } from "@/services/api/endpoints";

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
