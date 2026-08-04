import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { shouldUseMockForFeature } from "@/services/api/runtime";
import { mockBackend } from "@/services/mock/mock-backend";

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
};

export const faqService = {
  listFaqs() {
    if (shouldUseMockForFeature("faq")) {
      return mockBackend.faq.list();
    }

    return apiClient.get<FAQ[]>(API_ENDPOINTS.faq.list);
  },

  createFaq(payload: { question: string; answer: string; display_order: number; is_visible: boolean }) {
    if (shouldUseMockForFeature("faq")) {
      return mockBackend.faq.create(payload);
    }

    return apiClient.post<{ success: boolean; id: string }>(API_ENDPOINTS.faq.list, payload);
  },

  updateFaq(id: string, payload: { question?: string; answer?: string; display_order?: number; is_visible?: boolean }) {
    if (shouldUseMockForFeature("faq")) {
      return mockBackend.faq.update(id, payload);
    }

    return apiClient.patch<{ success: boolean }>(API_ENDPOINTS.faq.byId(id), payload);
  },

  deleteFaq(id: string) {
    if (shouldUseMockForFeature("faq")) {
      return mockBackend.faq.delete(id);
    }

    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.faq.byId(id));
  },
};