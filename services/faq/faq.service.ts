import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { shouldUseMockForFeature } from "@/services/api/runtime";
import { mockBackend } from "@/services/mock/mock-backend";

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  visible: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ApiFaq = {
  id: string;
  question: string;
  answer: string;
  sortOrder?: number;
  visible?: boolean;
  display_order?: number;
  is_visible?: boolean;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
};

const normalizeFaq = (faq: ApiFaq): FAQ => ({
  id: faq.id,
  question: faq.question,
  answer: faq.answer,
  sortOrder: faq.sortOrder ?? faq.display_order ?? 0,
  visible: faq.visible ?? faq.is_visible ?? true,
  createdAt: faq.createdAt ?? faq.created_at,
  updatedAt: faq.updatedAt ?? faq.updated_at,
});

export const faqService = {
  listFaqs() {
    if (shouldUseMockForFeature("faq")) {
      return mockBackend.faq.list().then((rows) => rows.map(normalizeFaq));
    }

    return apiClient.get<{ data?: ApiFaq[] } | ApiFaq[]>(API_ENDPOINTS.faq.list).then((response) => {
      const rows = Array.isArray(response) ? response : response.data ?? [];
      return rows.map(normalizeFaq);
    });
  },

  createFaq(payload: { question: string; answer: string; sortOrder: number; visible: boolean }) {
    if (shouldUseMockForFeature("faq")) {
      return mockBackend.faq.create({
        question: payload.question,
        answer: payload.answer,
        display_order: payload.sortOrder,
        is_visible: payload.visible,
      });
    }

    return apiClient.post<{ success: boolean; id: string }>(API_ENDPOINTS.faq.list, {
      question: payload.question,
      answer: payload.answer,
      sortOrder: payload.sortOrder,
      visible: payload.visible,
    });
  },

  updateFaq(id: string, payload: { question?: string; answer?: string; sortOrder?: number; visible?: boolean }) {
    if (shouldUseMockForFeature("faq")) {
      return mockBackend.faq.update(id, {
        question: payload.question,
        answer: payload.answer,
        display_order: payload.sortOrder,
        is_visible: payload.visible,
      });
    }

    return apiClient.patch<{ success: boolean }>(API_ENDPOINTS.faq.byId(id), {
      question: payload.question,
      answer: payload.answer,
      sortOrder: payload.sortOrder,
      visible: payload.visible,
    });
  },

  deleteFaq(id: string) {
    if (shouldUseMockForFeature("faq")) {
      return mockBackend.faq.delete(id);
    }

    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.faq.byId(id));
  },
};