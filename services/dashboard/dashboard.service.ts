import { apiClient } from "@/services/api/client";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { shouldUseMockForFeature } from "@/services/api/runtime";
import { mockBackend } from "@/services/mock/mock-backend";

type DashboardOverview = {
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
};

export const dashboardService = {
  async getOverview() {
    if (shouldUseMockForFeature("dashboard")) {
      return mockBackend.dashboard.getOverview();
    }

    return apiClient
      .get<{ data?: DashboardOverview } | DashboardOverview>(API_ENDPOINTS.settings.dashboardOverview)
      .then((response) => ("data" in response && response.data ? response.data : response));
  },
};
