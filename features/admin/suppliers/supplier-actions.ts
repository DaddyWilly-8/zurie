import { supplierService } from "@/services/suppliers/supplier.service";
import type { SupplierForm } from "./types";

export const supplierActions = {
  list(page: number, pageSize: number) {
    return supplierService.list({ page, pageSize });
  },

  create(form: SupplierForm) {
    return supplierService.create({
      name: form.name,
      phone: form.phone || undefined,
      email: form.email || undefined,
      address: form.address || undefined,
    });
  },

  update(id: number, form: SupplierForm) {
    return supplierService.update(id, {
      name: form.name,
      phone: form.phone || undefined,
      email: form.email || undefined,
      address: form.address || undefined,
    });
  },

  setActive(id: number, isActive: boolean) {
    return supplierService.setActive(id, isActive);
  },
};
