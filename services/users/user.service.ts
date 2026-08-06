import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

type UserRole = "super_admin" | "admin" | "staff";

type AdminUserApi = {
  id: string | number;
  full_name?: string | null;
  name?: string | null;
  role?: UserRole;
  roles?: Array<{ id?: number; name?: string }>;
  roleIds?: number[];
  created_at?: string;
  createdAt?: string;
};

const normalizeRole = (row: AdminUserApi): UserRole => {
  if (row.role) return row.role;
  const roleName = row.roles?.[0]?.name;
  if (roleName === "super_admin" || roleName === "admin" || roleName === "staff") {
    return roleName;
  }
  return "staff";
};

const normalizeUserRow = (row: AdminUserApi) => ({
  id: String(row.id),
  full_name: row.full_name ?? row.name ?? null,
  role: normalizeRole(row),
  roleIds: row.roleIds ?? (row.roles ?? []).map((role) => Number(role.id)).filter((id) => Number.isFinite(id)),
  created_at: row.created_at ?? row.createdAt ?? new Date().toISOString(),
});

export const userService = {
  listUsers() {
    return apiClient.get<{ data?: AdminUserApi[] }>(API_ENDPOINTS.adminUsers.list).then((res) =>
      (res.data ?? []).map(normalizeUserRow),
    );
  },

  updateRole(id: string, role: UserRole, roleIds?: number[]) {
    if (roleIds?.length) {
      return apiClient.patch<{ success: boolean }>(API_ENDPOINTS.adminUsers.byId(id), { roleIds });
    }

    // Fallback to legacy backend shape if role IDs are not available in list data.
    return apiClient.patch<{ success: boolean }>(API_ENDPOINTS.adminUsers.byId(id), { role });
  },

  createUser(payload: { name: string; email: string; password: string }) {
    return apiClient.post<{ success: boolean; data: { id: string | number; name: string; email: string } }>(API_ENDPOINTS.users.create, payload);
  },

  createRole(payload: { name: string; description?: string }) {
    return apiClient.post<{ success: boolean; data: { id: string | number; name: string } }>(API_ENDPOINTS.roles.create, payload);
  },

  attachRoleToUser(userId: string, roleId: number) {
    return apiClient.post<{ success: boolean }>(API_ENDPOINTS.users.attachRole(userId), { roleId });
  },

  attachPermissionToRole(roleId: number, permissionId: number) {
    return apiClient.post<{ success: boolean }>(API_ENDPOINTS.roles.attachPermission(String(roleId)), { permissionId });
  },

  updateUserRoles(id: string, roleIds: number[]) {
    return apiClient.patch<{ success: boolean }>(API_ENDPOINTS.adminUsers.byId(id), { roleIds });
  },
};
