export type AdminCustomerRow = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  created_at?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export type AdminCustomerDetail = AdminCustomerRow & {
  [key: string]: unknown;
};
