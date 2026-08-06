import { apiClient } from "@/services/api/client";
import { API_ENDPOINTS } from "@/services/api/endpoints";

export type DashboardOverview = {
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

const unwrapOverview = (response: DashboardOverview | { data?: DashboardOverview }) => {
  if ("data" in response && response.data) {
    return response.data;
  }

  return response as DashboardOverview;
};

export const dashboardService = {
  async getOverview() {
    return apiClient
      .get<{ data?: DashboardOverview } | DashboardOverview>(API_ENDPOINTS.settings.dashboardOverview)
      .then(unwrapOverview);
  },
};
