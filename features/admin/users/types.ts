// features/admin/users/types.ts
export type UserRole =
  | "Super Admin"
  | "Admin"
  | "Staff"
  | "Sales Manager"
  | "Operations Manager"
  | "Accountant"
  | "Store Person"
  | "Customer Service";

export type AdminUserRow = {
  id: string;
  full_name: string | null;
  email?: string;
  phone?: string | null;
  role: UserRole;
  roleIds?: number[];
  created_at: string;
  updated_at?: string;
};

export type Role = {
  id: number;
  name: string;
  description?: string;
  permissions?: Array<{ id: number; name: string }>;
  users_count?: number;
  created_at?: string;
  updated_at?: string;
};
