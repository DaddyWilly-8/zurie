import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import type { BrandContent, ContactInfo } from "@/types/content";

export const contentService = {
  getBrandContent() {
    return apiClient.get<{ data: BrandContent }>(API_ENDPOINTS.settings.brand).then((res) =>
      (res as unknown as { data: BrandContent }).data,
    );
  },

  updateBrandContent(payload: Partial<BrandContent>) {
    return apiClient.put<{ success: boolean }>(API_ENDPOINTS.settings.brand, payload);
  },

  getContactInfo() {
    return apiClient.get<{ data: ContactInfo }>(API_ENDPOINTS.settings.contact).then((res) =>
      (res as unknown as { data: ContactInfo }).data,
    );
  },

  updateContactInfo(payload: Partial<ContactInfo>) {
    return apiClient.put<{ success: boolean }>(API_ENDPOINTS.settings.contact, payload);
  },

  getHomepageSettings() {
    return apiClient.get<{ data: Record<string, unknown> }>(API_ENDPOINTS.settings.homepage).then(
      (res) => (res as unknown as { data: Record<string, unknown> }).data,
    );
  },

  updateHomepageSettings(payload: Record<string, unknown>) {
    return apiClient.put<{ success: boolean }>(API_ENDPOINTS.settings.homepage, payload);
  },
};
