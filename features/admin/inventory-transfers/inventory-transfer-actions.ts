import { inventoryTransferService } from "@/services/inventory-transfers/inventory-transfer.service";
import type { InventoryTransferForm } from "./types";

const toPayload = (form: InventoryTransferForm) => ({
  type: form.type,
  sourceOutletId: Number(form.sourceOutletId),
  ...(form.type === "internal"
    ? {
        destinationOutletId:
          form.destinationOutletId === ""
            ? null
            : Number(form.destinationOutletId),
      }
    : {}),
  ...(form.type === "cost_center_change"
    ? {
        sourceCostCenterId:
          form.sourceCostCenterId === ""
            ? null
            : Number(form.sourceCostCenterId),
        destinationCostCenterId:
          form.destinationCostCenterId === ""
            ? null
            : Number(form.destinationCostCenterId),
      }
    : {}),
  transferDate: form.transferDate || null,
  notes: form.notes || undefined,
  items: form.items
    .filter((line) => line.productId !== "")
    .map((line) => ({
      productId: Number(line.productId),
      quantity: Number(line.quantity) || 0,
    })),
});

export const inventoryTransferActions = {
  list(page: number, pageSize: number) {
    return inventoryTransferService.list({ page, pageSize });
  },

  create(form: InventoryTransferForm) {
    return inventoryTransferService.create(toPayload(form));
  },

  get(id: number) {
    return inventoryTransferService.get(id);
  },
};
