import { userService } from "@/services/users/user.service";
import type { AdminUserRow, UserRole, Role, Permission } from "./types";

export const userActions = {
  async list(): Promise<AdminUserRow[]> {
    const payload = await userService.listUsers();
    return payload as AdminUserRow[];
  },

  async listRoles(): Promise<Role[]> {
    const payload = await userService.listRoles();
    return payload as Role[];
  },

  async listPermissions(): Promise<Permission[]> {
    const payload = await userService.listPermissions();
    return payload as Permission[];
  },

  updateRole(id: string, role: UserRole, roleIds?: number[]) {
    return userService.updateRole(id, role, roleIds);
  },

  updateUserRoles(id: string, roleIds: number[]) {
    return userService.updateUserRoles(id, roleIds);
  },

  createUser(payload: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    return userService.createUser(payload);
  },

  createRole(payload: { name: string; description?: string }) {
    return userService.createRole(payload);
  },

  updateRolePermissions(roleId: number, permissionIds: number[]) {
    return userService.syncRolePermissions(roleId, permissionIds);
  },

  attachRoleToUser(userId: string, roleId: number) {
    return userService.attachRoleToUser(userId, roleId);
  },
};
