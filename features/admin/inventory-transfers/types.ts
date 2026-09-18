import type { InventoryTransferType } from "@/services/inventory-transfers/inventory-transfer.service";

export type {
  InventoryTransfer,
  InventoryTransferItem,
  InventoryTransferType,
} from "@/services/inventory-transfers/inventory-transfer.service";

export type InventoryTransferLineForm = {
  productId: number | "";
  quantity: string;
};

export type InventoryTransferForm = {
  type: InventoryTransferType;
  sourceOutletId: number | "";
  destinationOutletId: number | "";
  sourceCostCenterId: number | "";
  destinationCostCenterId: number | "";
  transferDate: string;
  notes: string;
  items: InventoryTransferLineForm[];
};

export const emptyInventoryTransferLine: InventoryTransferLineForm = {
  productId: "",
  quantity: "1",
};

export const emptyInventoryTransferForm: InventoryTransferForm = {
  type: "internal",
  sourceOutletId: "",
  destinationOutletId: "",
  sourceCostCenterId: "",
  destinationCostCenterId: "",
  transferDate: "",
  notes: "",
  items: [{ ...emptyInventoryTransferLine }],
};
