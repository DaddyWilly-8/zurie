import { priceListService } from "@/services/price-lists/price-list.service";
import type { PriceListForm } from "./types";

const toPayload = (form: PriceListForm) => ({
  name: form.name,
  outletId: form.outletId === "" ? null : form.outletId,
  customerId: form.customerId === "" ? null : form.customerId,
  validFrom: form.validFrom || null,
  validTo: form.validTo || null,
});

export const priceListActions = {
  list() {
    return priceListService.list();
  },

  create(form: PriceListForm) {
    return priceListService.create(toPayload(form));
  },

  update(id: number, form: PriceListForm) {
    return priceListService.update(id, toPayload(form));
  },

  setActive(id: number, isActive: boolean) {
    return priceListService.setActive(id, isActive);
  },

  setItem(id: number, productId: number, price: number, salePrice?: number) {
    return priceListService.setItem(id, productId, price, salePrice);
  },

  removeItem(id: number, productId: number) {
    return priceListService.removeItem(id, productId);
  },
};
