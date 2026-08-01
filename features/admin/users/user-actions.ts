import { userService } from "@/services/users/user.service";
import type { AdminUserRow, UserRole } from "./types";

export const userActions = {
  async list(): Promise<AdminUserRow[]> {
    const payload = await userService.listUsers();
    return payload as AdminUserRow[];
  },

  updateRole(id: string, role: UserRole) {
    return userService.updateRole(id, role);
  },
};
