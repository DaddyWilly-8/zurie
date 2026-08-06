import { userService } from "@/services/users/user.service";
import type { AdminUserRow, UserRole } from "./types";

export const userActions = {
  async list(): Promise<AdminUserRow[]> {
    const payload = await userService.listUsers();
    return payload as AdminUserRow[];
  },

  updateRole(id: string, role: UserRole, roleIds?: number[]) {
    return userService.updateRole(id, role, roleIds);
  },

  createUser(payload: { name: string; email: string; password: string }) {
    return userService.createUser(payload);
  },

  createRole(payload: { name: string; description?: string }) {
    return userService.createRole(payload);
  },

  attachRoleToUser(userId: string, roleId: number) {
    return userService.attachRoleToUser(userId, roleId);
  },

  attachPermissionToRole(roleId: number, permissionId: number) {
    return userService.attachPermissionToRole(roleId, permissionId);
  },

  updateUserRoles(id: string, roleIds: number[]) {
    return userService.updateUserRoles(id, roleIds);
  },
};
