export type {
  PriceList,
  PriceListItem,
} from "@/services/price-lists/price-list.service";

export type PriceListForm = {
  name: string;
  outletId: number | "";
  customerId: number | "";
  validFrom: string;
  validTo: string;
};

export const emptyPriceListForm: PriceListForm = {
  name: "",
  outletId: "",
  customerId: "",
  validFrom: "",
  validTo: "",
};
