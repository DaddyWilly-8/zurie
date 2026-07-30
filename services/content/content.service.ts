import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { isMockMode } from "@/services/api/runtime";
import { mockBackend } from "@/services/mock/mock-backend";
import type { BrandContent, ContactInfo } from "@/types/content";

export const contentService = {
  getBrandContent() {
    if (isMockMode()) {
      return mockBackend.content.getBrandContent();
    }

    return apiClient.get<{ data: BrandContent }>(API_ENDPOINTS.settings.brand).then((res) =>
      (res as unknown as { data: BrandContent }).data,
    );
  },

  updateBrandContent(payload: Partial<BrandContent>) {
    if (isMockMode()) {
      return mockBackend.content.updateBrandContent(payload);
    }

    return apiClient.put<{ success: boolean }>(API_ENDPOINTS.settings.brand, payload);
  },

  getContactInfo() {
    if (isMockMode()) {
      return mockBackend.content.getContactInfo();
    }

    return apiClient.get<{ data: ContactInfo }>(API_ENDPOINTS.settings.contact).then((res) =>
      (res as unknown as { data: ContactInfo }).data,
    );
  },

  updateContactInfo(payload: Partial<ContactInfo>) {
    if (isMockMode()) {
      return mockBackend.content.updateContactInfo(payload);
    }

    return apiClient.put<{ success: boolean }>(API_ENDPOINTS.settings.contact, payload);
  },

  getHomepageSettings() {
    if (isMockMode()) {
      return mockBackend.content.getHomepage();
    }

    return apiClient.get<{ data: Record<string, unknown> }>(API_ENDPOINTS.settings.homepage).then(
      (res) => (res as unknown as { data: Record<string, unknown> }).data,
    );
  },

  updateHomepageSettings(payload: Record<string, unknown>) {
    if (isMockMode()) {
      return mockBackend.content.updateHomepage(payload);
    }

    return apiClient.put<{ success: boolean }>(API_ENDPOINTS.settings.homepage, payload);
  },
};
