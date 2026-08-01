export type UserRole = "super_admin" | "admin" | "staff";

export type AdminUserRow = {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
};
