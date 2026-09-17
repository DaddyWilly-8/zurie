export type { Supplier } from "@/services/suppliers/supplier.service";

export type SupplierForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
};

export const emptySupplierForm: SupplierForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
};
