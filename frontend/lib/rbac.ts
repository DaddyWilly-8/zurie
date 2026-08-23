export const ADMIN_ROLES = ["super_admin", "admin", "staff"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

const permissionsByRole: Record<AdminRole, string[]> = {
  super_admin: ["*"],
  admin: [
    "dashboard:view",
    "products:read",
    "products:write",
    "categories:read",
    "categories:write",
    "orders:read",
    "orders:write",
    "content:read",
    "content:write",
    "settings:read",
    "settings:write",
    "enquiries:read",
    "enquiries:write",
    "media:read",
    "media:write",
    "activity:read",
  ],
  staff: [
    "dashboard:view",
    "products:read",
    "products:write",
    "categories:read",
    "orders:read",
    "orders:write",
    "enquiries:read",
    "enquiries:write",
    "media:read",
  ],
};

export const hasPermission = (role: AdminRole, permission: string) => {
  const permissions = permissionsByRole[role] ?? [];
  return permissions.includes("*") || permissions.includes(permission);
};

export const canAccessSettings = (role: AdminRole) =>
  hasPermission(role, "settings:write") || role === "super_admin";
