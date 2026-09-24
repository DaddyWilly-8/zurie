import { couponService } from "@/services/coupons/coupon.service";
import {
  convertToBaseCurrency,
  type CurrencyCode,
  type CurrencyRateMap,
} from "@/utils/currency";
import type { CouponForm } from "./types";

const PAGE_SIZE = 50;

export const couponActions = {
  list() {
    return couponService.listAdmin({ page: 1, pageSize: PAGE_SIZE });
  },

  /**
   * A fixed discount and the minimum order are money typed in the admin's
   * selected currency, so they're converted to TZS before saving; a
   * percentage is sent as-is.
   */
  create(form: CouponForm, currency: CurrencyCode, rates: CurrencyRateMap) {
    const toTzs = (value: string) =>
      Math.round(convertToBaseCurrency(Number(value), currency, rates) * 100) /
      100;

    return couponService.create({
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: form.type === "fixed" ? toTzs(form.value) : Number(form.value),
      minOrderAmount: form.minOrderAmount ? toTzs(form.minOrderAmount) : null,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      validFrom: form.validFrom || null,
      validTo: form.validTo || null,
    });
  },

  setActive(id: number, isActive: boolean) {
    return couponService.setActive(id, isActive);
  },
};
