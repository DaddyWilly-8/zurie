import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

import type {
  BrandSettings,
  ContactSettings,
  HomepageSettings,
  PoliciesSettings,
  PublicSettings,
  SiteSettingsBundle,
} from "@/types/content";

/**
 * §8 Settings service — v2.24 API contract.
 *
 * Public:  GET  /settings                      (aggregate bundle)
 * Admin:   GET/PUT /admin/settings/brand, /admin/settings/contact,
 *          /admin/settings/homepage, /admin/settings/policies
 * Uploads: POST /admin/settings/brand/logo, /admin/settings/homepage/hero-image
 *
 * All admin PUTs are flat payloads (no `brand`/`contact`/etc wrapper key).
 * The category is implied by the URL. `logoUrl` / `heroImageUrl` are
 * read-only — set via the multipart upload endpoints.
 */
export const contentService = {
  /** GET /settings (public) — everything the viewfront needs in one call. */
  async getPublicSettings(): Promise<PublicSettings> {
    return apiClient
      .get<{ data: PublicSettings }>(API_ENDPOINTS.settings.public)
      .then((res) => (res as unknown as { data: PublicSettings }).data);
  },

  // ── Brand ──────────────────────────────────────────────────────────────
  getBrandSettings(): Promise<BrandSettings> {
    return apiClient
      .get<{ data: BrandSettings }>(API_ENDPOINTS.settings.brand)
      .then((res) => (res as unknown as { data: BrandSettings }).data);
  },

  updateBrandSettings(payload: Partial<BrandSettings>) {
    return apiClient.put<{ success: boolean }>(
      API_ENDPOINTS.settings.brand,
      payload,
    );
  },

  /** POST /admin/settings/brand/logo (multipart, field name: image) */
  uploadBrandLogo(file: File) {
    const formData = new FormData();
    formData.append("image", file);

    return apiClient.request<{ success: boolean; data: BrandSettings }>(
      API_ENDPOINTS.settings.brandLogo,
      { method: "POST", body: formData, headers: {} },
    );
  },

  // ── Contact ────────────────────────────────────────────────────────────
  getContactSettings(): Promise<ContactSettings> {
    return apiClient
      .get<{ data: ContactSettings }>(API_ENDPOINTS.settings.contact)
      .then((res) => (res as unknown as { data: ContactSettings }).data);
  },

  /**
   * Full replace — `phones`, `emails` and `socialLinks` must ALL be present.
   * Send `[]` to clear a list; omitting a key is a 422.
   */
  updateContactSettings(payload: ContactSettings) {
    return apiClient.put<{ success: boolean }>(
      API_ENDPOINTS.settings.contact,
      payload,
    );
  },

  // ── Homepage ───────────────────────────────────────────────────────────
  getHomepageSettings(): Promise<HomepageSettings> {
    return apiClient
      .get<{ data: HomepageSettings }>(API_ENDPOINTS.settings.homepage)
      .then((res) => (res as unknown as { data: HomepageSettings }).data);
  },

  updateHomepageSettings(payload: Partial<HomepageSettings>) {
    return apiClient.put<{ success: boolean }>(
      API_ENDPOINTS.settings.homepage,
      payload,
    );
  },

  /** POST /admin/settings/homepage/hero-image (multipart, field name: image) */
  uploadHomepageHeroImage(file: File) {
    const formData = new FormData();
    formData.append("image", file);

    return apiClient.request<{ success: boolean; data: HomepageSettings }>(
      API_ENDPOINTS.settings.homepageHeroImage,
      { method: "POST", body: formData, headers: {} },
    );
  },

  // ── Policies ───────────────────────────────────────────────────────────
  getPoliciesSettings(): Promise<PoliciesSettings> {
    return apiClient
      .get<{ data: PoliciesSettings }>(API_ENDPOINTS.settings.policies)
      .then((res) => (res as unknown as { data: PoliciesSettings }).data);
  },

  updatePoliciesSettings(payload: Partial<PoliciesSettings>) {
    return apiClient.put<{ success: boolean }>(
      API_ENDPOINTS.settings.policies,
      payload,
    );
  },

  /**
   * Fetch all settings in parallel for the viewfront.
   * Returns the public aggregate with graceful fallback on failure.
   */
  async getSettingsBundle(): Promise<SiteSettingsBundle> {
    try {
      return await this.getPublicSettings();
    } catch {
      return {};
    }
  },
};
