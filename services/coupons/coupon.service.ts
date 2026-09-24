import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

/** Shape of Coupon\Resources\CouponResource on the backend. */
export type Coupon = {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  /** Percent for `percentage`, TZS amount for `fixed`. */
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  validFrom: string | null;
  validTo: string | null;
  isActive: boolean;
};

export type CouponPayload = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount?: number | null;
  maxUses?: number | null;
  validFrom?: string | null;
  validTo?: string | null;
};

export const couponService = {
  /**
   * POST /coupons/preview — validates a code against a TZS subtotal and
   * returns the discount it would give. Throws ApiError (422) with the
   * reason when the code can't be used.
   */
  preview(code: string, subtotal: number) {
    return apiClient
      .post<{ data: { valid: boolean; discountAmount: number } }>(
        API_ENDPOINTS.coupons.preview,
        { code, subtotal },
      )
      .then((response) => response.data);
  },

  listAdmin(params: { page: number; pageSize: number }) {
    return apiClient
      .get<{ data?: Coupon[]; meta?: { count?: number } }>(
        API_ENDPOINTS.coupons.adminList,
        { query: params },
      )
      .then((response) => ({
        data: response.data ?? [],
        count: response.meta?.count ?? 0,
      }));
  },

  create(payload: CouponPayload) {
    return apiClient.post<{ data: Coupon }>(
      API_ENDPOINTS.coupons.adminList,
      payload,
    );
  },

  setActive(id: number, isActive: boolean) {
    return apiClient.patch<{ data: Coupon }>(
      API_ENDPOINTS.coupons.adminById(id),
      { isActive },
    );
  },
};
