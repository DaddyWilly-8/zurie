// ── §8 Settings (v2.24 API contract) ──────────────────────────────────────

export type SettingsPhoneEntry = {
  label: string;
  value: string;
};

export type SettingsEmailEntry = {
  label: string;
  value: string;
};

export type SettingsSocialLink = {
  platform: string;
  url: string;
};

/**
 * GET/PUT /admin/settings/brand — flat payload, no `brand` wrapper key.
 * `logoUrl` is read-only here; set via POST /admin/settings/brand/logo.
 */
export type BrandSettings = {
  siteName: string;
  tagline: string;
  logoUrl?: string;
};

/**
 * GET/PUT /admin/settings/contact — flat payload, no `contact` wrapper key.
 * All three array keys MUST be present on every PUT (full replace).
 */
export type ContactSettings = {
  phones: SettingsPhoneEntry[];
  emails: SettingsEmailEntry[];
  socialLinks: SettingsSocialLink[];
};

/**
 * GET/PUT /admin/settings/homepage — flat payload, no `homepage` wrapper key.
 * `heroImageUrl` is read-only here; set via POST /admin/settings/homepage/hero-image.
 */
export type HomepageSettings = {
  heroHeading: string;
  heroSubheading: string;
  heroCtaText: string;
  heroCtaUrl: string;
  heroImageUrl?: string;
};

/**
 * GET/PUT /admin/settings/policies — flat payload, no `policies` wrapper key.
 */
export type PoliciesSettings = {
  deliveryPolicy: string;
  returnPolicy: string;
};

/**
 * GET /settings (public) — the aggregated bundle the viewfront consumes.
 * Categories with nothing saved resolve to `{}` / empty arrays.
 */
export type PublicSettings = {
  brand?: Partial<BrandSettings>;
  contact?: Partial<ContactSettings>;
  homepage?: Partial<HomepageSettings>;
  policies?: Partial<PoliciesSettings>;
};

export type SiteSettingsBundle = PublicSettings;

// ── Legacy types (kept only for tests / backward compat — not used by §8) ──
export type Testimonial = {
  id: string;
  name: string;
  quote: string;
  location: string;
};
