import { proformaInvoiceService } from "@/services/proforma-invoices/proforma-invoice.service";
import type { ProformaInvoiceForm } from "./types";

const toPayload = (form: ProformaInvoiceForm) => ({
  salesOutletId: Number(form.salesOutletId),
  stakeholderId: Number(form.stakeholderId),
  ...(form.currencyId !== "" ? { currencyId: Number(form.currencyId) } : {}),
  ...(form.proformaDate ? { proformaDate: form.proformaDate } : {}),
  expiryDate: form.expiryDate || null,
  notes: form.notes || undefined,
  items: form.items
    .filter((line) => line.productId !== "")
    .map((line) => ({
      productId: Number(line.productId),
      quantity: Number(line.quantity) || 0,
      unitPrice: Number(line.unitPrice) || 0,
    })),
});

export const proformaInvoiceActions = {
  list(page: number, pageSize: number) {
    return proformaInvoiceService.list({ page, pageSize });
  },

  create(form: ProformaInvoiceForm) {
    return proformaInvoiceService.create(toPayload(form));
  },

  update(id: number, form: ProformaInvoiceForm) {
    return proformaInvoiceService.update(id, toPayload(form));
  },

  setActive(id: number, isActive: boolean) {
    return proformaInvoiceService.setActive(id, isActive);
  },
};
