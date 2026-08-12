import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import type {
  UserRole,
  AdminUserRow,
  Role,
} from "@/features/admin/users/types";

type AdminUserApi = {
  id: string | number;
  full_name?: string | null;
  name?: string | null;
  email?: string;
  phone?: string | null;
  role?: UserRole;
  roles?: Array<{ id?: number; name?: string }>;
  roleIds?: number[];
  created_at?: string;
  createdAt?: string;
};

type RoleApi = {
  id: number;
  name: string;
  description?: string;
  permissions?: Array<{ id: number; name: string }>;
  users_count?: number;
  created_at?: string;
  updated_at?: string;
};

const normalizeRole = (row: AdminUserApi): UserRole => {
  if (row.role) return row.role;
  const roleName = row.roles?.[0]?.name;
  if (
    roleName === "Super Admin" ||
    roleName === "Admin" ||
    roleName === "Staff" ||
    roleName === "Sales Manager" ||
    roleName === "Operations Manager" ||
    roleName === "Accountant" ||
    roleName === "Store Person" ||
    roleName === "Customer Service"
  ) {
    return roleName as UserRole;
  }
  return "Staff";
};

const normalizeUserRow = (row: AdminUserApi): AdminUserRow => ({
  id: String(row.id),
  full_name: row.full_name ?? row.name ?? null,
  email: row.email ?? "",
  phone: row.phone ?? null,
  role: normalizeRole(row),
  roleIds:
    row.roleIds ??
    (row.roles ?? [])
      .map((role) => Number(role.id))
      .filter((id) => Number.isFinite(id)),
  created_at: row.created_at ?? row.createdAt ?? new Date().toISOString(),
});

export const userService = {
  listUsers() {
    return apiClient
      .get<{ data?: AdminUserApi[] }>(API_ENDPOINTS.adminUsers.list)
      .then((res) => (res.data ?? []).map(normalizeUserRow));
  },

  listRoles(): Promise<Role[]> {
    return apiClient.get<{ data?: RoleApi[] }>("/roles").then((res) =>
      (res.data ?? []).map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description || "",
        permissions: role.permissions || [],
        users_count: role.users_count || 0,
        created_at: role.created_at,
        updated_at: role.updated_at,
      })),
    );
  },

  updateRole(id: string, role: UserRole, roleIds?: number[]) {
    if (roleIds?.length) {
      return apiClient.patch<{ success: boolean }>(
        API_ENDPOINTS.adminUsers.byId(id),
        { roleIds },
      );
    }

    // Fallback to legacy backend shape if role IDs are not available in list data.
    return apiClient.patch<{ success: boolean }>(
      API_ENDPOINTS.adminUsers.byId(id),
      { role },
    );
  },

  createUser(payload: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    return apiClient.post<{
      success: boolean;
      data: { id: string | number; name: string; email: string };
    }>(API_ENDPOINTS.users.create, payload);
  },

  createRole(payload: { name: string; description?: string }) {
    return apiClient.post<{
      success: boolean;
      data: { id: string | number; name: string };
    }>(API_ENDPOINTS.roles.create, payload);
  },

  attachRoleToUser(userId: string, roleId: number) {
    return apiClient.post<{ success: boolean }>(
      API_ENDPOINTS.users.attachRole(userId),
      { roleId },
    );
  },

  attachPermissionToRole(roleId: number, permissionId: number) {
    return apiClient.post<{ success: boolean }>(
      API_ENDPOINTS.roles.attachPermission(String(roleId)),
      { permissionId },
    );
  },

  updateUserRoles(id: string, roleIds: number[]) {
    return apiClient.patch<{ success: boolean }>(
      API_ENDPOINTS.adminUsers.byId(id),
      { roleIds },
    );
  },
};
