import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export type ReviewStatus = "pending" | "approved" | "rejected";

/** Shape of Review\Resources\ReviewResource on the backend. */
export type ProductReview = {
  id: number;
  productId: number;
  customerId: number;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  productName: string | null;
  /** First name only — what the public product page shows. */
  reviewerName: string | null;
  /** Full name — admin moderation list only. */
  customerName: string | null;
  createdAt: string;
};

export const reviewService = {
  /** GET /products/{id}/reviews — approved reviews only. */
  listForProduct(productId: number | string) {
    return apiClient
      .get<{ data?: ProductReview[] }>(
        API_ENDPOINTS.reviews.forProduct(productId),
      )
      .then((response) => response.data ?? []);
  },

  /** POST /account/reviews — signed-in customer; starts as `pending`. */
  submit(payload: { productId: number; rating: number; comment?: string }) {
    return apiClient.post<{ data: ProductReview }>(
      API_ENDPOINTS.account.reviews,
      payload,
    );
  },

  listAdmin(params: { page: number; pageSize: number; status?: ReviewStatus }) {
    return apiClient
      .get<{ data?: ProductReview[]; meta?: { count?: number } }>(
        API_ENDPOINTS.reviews.adminList,
        { query: params },
      )
      .then((response) => ({
        data: response.data ?? [],
        count: response.meta?.count ?? 0,
      }));
  },

  updateStatus(id: number, status: ReviewStatus) {
    return apiClient.patch<{ data: ProductReview }>(
      API_ENDPOINTS.reviews.adminById(id),
      { status },
    );
  },
};
