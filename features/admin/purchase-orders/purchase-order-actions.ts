import { purchaseOrderService } from "@/services/procurement/purchase-order.service";
import type { PurchaseOrderForm } from "./types";

const toPayload = (form: PurchaseOrderForm) => ({
  stakeholderId: form.stakeholderId === "" ? null : Number(form.stakeholderId),
  ...(form.currencyId !== "" ? { currencyId: Number(form.currencyId) } : {}),
  ...(form.dateRequired ? { dateRequired: form.dateRequired } : {}),
  notes: form.notes || undefined,
  items: form.items
    .filter((line) => line.productId !== "" && line.measurementUnitId !== "")
    .map((line) => ({
      productId: Number(line.productId),
      measurementUnitId: Number(line.measurementUnitId),
      quantity: Number(line.quantity) || 0,
      rate: Number(line.rate) || 0,
      ...(line.vatPercentage !== ""
        ? { vatPercentage: Number(line.vatPercentage) }
        : {}),
    })),
});

export const purchaseOrderActions = {
  list(page: number, pageSize: number) {
    return purchaseOrderService.list({ page, pageSize });
  },

  create(form: PurchaseOrderForm) {
    return purchaseOrderService.create({
      ...toPayload(form),
      instantReceive: form.instantReceive,
    });
  },

  update(id: number, form: PurchaseOrderForm) {
    return purchaseOrderService.update(id, toPayload(form));
  },

  remove(id: number) {
    return purchaseOrderService.remove(id);
  },

  close(id: number) {
    return purchaseOrderService.close(id);
  },

  reopen(id: number) {
    return purchaseOrderService.reopen(id);
  },

  cancel(id: number) {
    return purchaseOrderService.cancel(id);
  },
};
