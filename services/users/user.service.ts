import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { isMockMode } from "@/services/api/runtime";
import { mockBackend } from "@/services/mock/mock-backend";

export const userService = {
  listUsers() {
    if (isMockMode()) {
      return mockBackend.users.list();
    }

    return apiClient.get<{ data: unknown[] }>(API_ENDPOINTS.adminUsers.list).then((res) =>
      res.data ?? [],
    );
  },

  updateRole(id: string, role: "super_admin" | "admin" | "staff") {
    if (isMockMode()) {
      return mockBackend.users.updateRole(id, role);
    }

    return apiClient.patch<{ success: boolean }>(API_ENDPOINTS.adminUsers.byId(id), { role });
  },
};
