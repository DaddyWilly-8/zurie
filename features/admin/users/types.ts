// features/admin/users/types.ts
export type UserRole =
  | "super_admin"
  | "admin"
  | "staff"
  | "sales_manager"
  | "operations_manager"
  | "accountant"
  | "store_person"
  | "customer_service";

export type Permission = {
  id: number;
  key: string;
  description: string;
};

export type Role = {
  id: number;
  name: string;
  description: string | null;
  permissions: string[]; // Array of permission keys
  users_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type AdminUserRow = {
  id: string;
  full_name: string | null;
  email?: string;
  phone?: string | null;
  role: UserRole;
  roleIds?: number[];
  roles?: Role[];
  created_at: string;
};

export type AdminUserDetail = {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  permissions: string[];
  created_at: string;
};
