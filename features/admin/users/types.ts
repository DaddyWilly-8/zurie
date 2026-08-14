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
  name?: string | null; // Added name property
  email?: string;
  phone?: string | null;
  role: UserRole;
  roleNames?: string[]; // Role names from the API
  roleIds?: number[]; // Role IDs after matching with roles list
  roles?: string[] | Role[];
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
