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
/**
 * Categories that have never been saved resolve to `{}` (or, for contact,
 * possibly missing array keys) per §8 — normalize every GET so callers never
 * have to null-check individual fields.
 */
const normalizeBrand = (
  data: Partial<BrandSettings> | null | undefined,
): BrandSettings => ({
  siteName: data?.siteName ?? "",
  tagline: data?.tagline ?? "",
  logoUrl: data?.logoUrl ?? "",
});

const normalizeContact = (
  data: Partial<ContactSettings> | null | undefined,
): ContactSettings => ({
  phones: Array.isArray(data?.phones) ? data.phones : [],
  emails: Array.isArray(data?.emails) ? data.emails : [],
  socialLinks: Array.isArray(data?.socialLinks) ? data.socialLinks : [],
});

const normalizeHomepage = (
  data: Partial<HomepageSettings> | null | undefined,
): HomepageSettings => ({
  heroHeading: data?.heroHeading ?? "",
  heroSubheading: data?.heroSubheading ?? "",
  heroCtaText: data?.heroCtaText ?? "",
  heroCtaUrl: data?.heroCtaUrl ?? "",
  heroImageUrl: data?.heroImageUrl ?? "",
});

const normalizePolicies = (
  data: Partial<PoliciesSettings> | null | undefined,
): PoliciesSettings => ({
  deliveryPolicy: data?.deliveryPolicy ?? "",
  returnPolicy: data?.returnPolicy ?? "",
});

export const contentService = {
  /** GET /settings (public) — everything the viewfront needs in one call. */
  async getPublicSettings(): Promise<PublicSettings> {
    const data = await apiClient
      .get<{ data: PublicSettings }>(API_ENDPOINTS.settings.public)
      .then((res) => (res as unknown as { data: PublicSettings }).data);

    return {
      brand: normalizeBrand(data?.brand),
      contact: normalizeContact(data?.contact),
      homepage: normalizeHomepage(data?.homepage),
      policies: normalizePolicies(data?.policies),
    };
  },

  // ── Brand ──────────────────────────────────────────────────────────────
  async getBrandSettings(): Promise<BrandSettings> {
    const data = await apiClient
      .get<{ data: BrandSettings }>(API_ENDPOINTS.settings.brand)
      .then((res) => (res as unknown as { data: BrandSettings }).data);
    return normalizeBrand(data);
  },

  async updateBrandSettings(
    payload: Partial<BrandSettings>,
  ): Promise<BrandSettings> {
    const data = await apiClient
      .put<{ data: BrandSettings }>(API_ENDPOINTS.settings.brand, payload)
      .then((res) => (res as unknown as { data: BrandSettings }).data);
    return normalizeBrand(data);
  },

  /** POST /admin/settings/brand/logo (multipart, field name: image) */
  async uploadBrandLogo(file: File): Promise<BrandSettings> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiClient.request<{
      success: boolean;
      data: BrandSettings;
    }>(API_ENDPOINTS.settings.brandLogo, {
      method: "POST",
      body: formData,
      headers: {},
    });
    return normalizeBrand(response.data);
  },

  // ── Contact ────────────────────────────────────────────────────────────
  async getContactSettings(): Promise<ContactSettings> {
    const data = await apiClient
      .get<{ data: ContactSettings }>(API_ENDPOINTS.settings.contact)
      .then((res) => (res as unknown as { data: ContactSettings }).data);
    return normalizeContact(data);
  },

  /**
   * Full replace — `phones`, `emails` and `socialLinks` must ALL be present.
   * Send `[]` to clear a list; omitting a key is a 422.
   */
  async updateContactSettings(
    payload: ContactSettings,
  ): Promise<ContactSettings> {
    const data = await apiClient
      .put<{ data: ContactSettings }>(API_ENDPOINTS.settings.contact, payload)
      .then((res) => (res as unknown as { data: ContactSettings }).data);
    return normalizeContact(data);
  },

  // ── Homepage ───────────────────────────────────────────────────────────
  async getHomepageSettings(): Promise<HomepageSettings> {
    const data = await apiClient
      .get<{ data: HomepageSettings }>(API_ENDPOINTS.settings.homepage)
      .then((res) => (res as unknown as { data: HomepageSettings }).data);
    return normalizeHomepage(data);
  },

  async updateHomepageSettings(
    payload: Partial<HomepageSettings>,
  ): Promise<HomepageSettings> {
    const data = await apiClient
      .put<{ data: HomepageSettings }>(API_ENDPOINTS.settings.homepage, payload)
      .then((res) => (res as unknown as { data: HomepageSettings }).data);
    return normalizeHomepage(data);
  },

  /** POST /admin/settings/homepage/hero-image (multipart, field name: image) */
  async uploadHomepageHeroImage(file: File): Promise<HomepageSettings> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiClient.request<{
      success: boolean;
      data: HomepageSettings;
    }>(API_ENDPOINTS.settings.homepageHeroImage, {
      method: "POST",
      body: formData,
      headers: {},
    });
    return normalizeHomepage(response.data);
  },

  // ── Policies ───────────────────────────────────────────────────────────
  async getPoliciesSettings(): Promise<PoliciesSettings> {
    const data = await apiClient
      .get<{ data: PoliciesSettings }>(API_ENDPOINTS.settings.policies)
      .then((res) => (res as unknown as { data: PoliciesSettings }).data);
    return normalizePolicies(data);
  },

  async updatePoliciesSettings(
    payload: Partial<PoliciesSettings>,
  ): Promise<PoliciesSettings> {
    const data = await apiClient
      .put<{ data: PoliciesSettings }>(API_ENDPOINTS.settings.policies, payload)
      .then((res) => (res as unknown as { data: PoliciesSettings }).data);
    return normalizePolicies(data);
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
