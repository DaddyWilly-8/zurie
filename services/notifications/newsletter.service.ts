import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export type NewsletterSubscriber = {
  id: number;
  email: string;
  createdAt: string;
};

export const newsletterService = {
  subscribe(email: string) {
    return apiClient.post<{ success: boolean }>(API_ENDPOINTS.newsletter, {
      email,
    });
  },

  /** GET /admin/newsletter-subscribers (customer_view). */
  listSubscribers(params: { page: number; pageSize: number; search?: string }) {
    return apiClient
      .get<{ data?: NewsletterSubscriber[]; meta?: { count?: number } }>(
        API_ENDPOINTS.newsletterSubscribers,
        { query: params },
      )
      .then((response) => ({
        data: response.data ?? [],
        count: response.meta?.count ?? 0,
      }));
  },
};
