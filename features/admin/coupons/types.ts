export type { Coupon } from "@/services/coupons/coupon.service";

/** Form values as typed — amounts are in the admin's selected currency. */
export type CouponForm = {
  code: string;
  type: "percentage" | "fixed";
  value: string;
  minOrderAmount: string;
  maxUses: string;
  validFrom: string;
  validTo: string;
};

export const emptyCouponForm: CouponForm = {
  code: "",
  type: "percentage",
  value: "",
  minOrderAmount: "",
  maxUses: "",
  validFrom: "",
  validTo: "",
};
