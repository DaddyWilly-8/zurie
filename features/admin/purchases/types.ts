export type {
  Purchase,
  PurchaseItem,
} from "@/services/purchases/purchase.service";

export type PurchaseLineForm = {
  productId: number | "";
  quantity: string;
  costPrice: string;
};

export type PurchaseForm = {
  supplierId: number | "";
  items: PurchaseLineForm[];
  amountPaid: string;
  notes: string;
  currencyId: number | "";
};

export const emptyPurchaseLine: PurchaseLineForm = {
  productId: "",
  quantity: "1",
  costPrice: "",
};

export const emptyPurchaseForm: PurchaseForm = {
  supplierId: "",
  items: [{ ...emptyPurchaseLine }],
  amountPaid: "0",
  notes: "",
  currencyId: "",
};
