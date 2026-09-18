export type {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderStatus,
} from "@/services/procurement/purchase-order.service";

export type PurchaseOrderLineForm = {
  productId: number | "";
  measurementUnitId: number | "";
  quantity: string;
  rate: string;
  vatPercentage: string;
};

export type PurchaseOrderForm = {
  stakeholderId: number | "";
  currencyId: number | "";
  dateRequired: string;
  notes: string;
  /** "Instant Receive" — immediately posts a GRN for every line in full, same one-step behavior the old standalone Purchases flow had. */
  instantReceive: boolean;
  items: PurchaseOrderLineForm[];
};

export const emptyPurchaseOrderLine: PurchaseOrderLineForm = {
  productId: "",
  measurementUnitId: "",
  quantity: "1",
  rate: "",
  vatPercentage: "",
};

export const emptyPurchaseOrderForm: PurchaseOrderForm = {
  stakeholderId: "",
  currencyId: "",
  dateRequired: "",
  notes: "",
  instantReceive: false,
  items: [{ ...emptyPurchaseOrderLine }],
};
