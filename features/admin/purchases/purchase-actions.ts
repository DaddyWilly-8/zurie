import { purchaseService } from "@/services/purchases/purchase.service";
import type { PurchaseForm } from "./types";

export const purchaseActions = {
  list(page: number, pageSize: number) {
    return purchaseService.list({ page, pageSize });
  },

  create(form: PurchaseForm) {
    return purchaseService.create({
      supplierId: Number(form.supplierId),
      items: form.items
        .filter((line) => line.productId !== "")
        .map((line) => ({
          productId: Number(line.productId),
          quantity: Number(line.quantity) || 1,
          costPrice: Number(line.costPrice) || 0,
        })),
      amountPaid: Number(form.amountPaid) || 0,
      notes: form.notes || undefined,
    });
  },
};
