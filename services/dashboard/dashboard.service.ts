import { apiClient } from "@/services/api/client";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { isMockMode } from "@/services/api/runtime";
import { mockBackend } from "@/services/mock/mock-backend";

export const dashboardService = {
  async getOverview() {
    if (isMockMode()) {
      return mockBackend.dashboard.getOverview();
    }

    return apiClient.get<{
      totalProducts: number;
      activeProducts: number;
      outOfStockProducts: number;
      totalCategories: number;
      pendingOrders: number;
      completedOrders: number;
      enquiries: number;
      lowStockProducts: Array<{ id: string; name: string; stock_count: number }>;
      recentProducts: Array<{ id: string; name: string; stock_count: number }>;
      recentOrders: Array<{ id: string; order_number: string; status: string }>;
      recentEnquiries: Array<{ id: string; name: string; status: string }>;
    }>(API_ENDPOINTS.settings.dashboardOverview);
  },
};
