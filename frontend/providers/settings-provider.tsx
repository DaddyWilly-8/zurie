"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import type {
  BrandSettings,
  ContactSettings,
  HomepageSettings,
  PoliciesSettings,
  SettingsEmailEntry,
  SettingsPhoneEntry,
  SettingsSocialLink,
} from "@/types/content";
import { contentService } from "@/services/content/content.service";
import { SITE } from "@/constants/site";

const emptyContact: ContactSettings = {
  phones: [],
  emails: [],
  socialLinks: [],
};

const emptyBrand: BrandSettings = {
  siteName: SITE.displayName,
  tagline: SITE.description,
  logoUrl: "",
};

const emptyHomepage: HomepageSettings = {
  heroHeading: SITE.displayName,
  heroSubheading: "",
  heroCtaText: "Shop Now",
  heroCtaUrl: "/shop",
  heroImageUrl: "",
};

const emptyPolicies: PoliciesSettings = {
  deliveryPolicy: "",
  returnPolicy: "",
};

type SettingsContextValue = {
  brand: BrandSettings;
  contact: ContactSettings;
  homepage: HomepageSettings;
  policies: PoliciesSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  // convenience getters for the most common lookups
  whatsappNumber: string;
  phoneNumber: string;
  emailAddress: string;
  socialLinks: SettingsSocialLink[];
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider = ({ children }: PropsWithChildren) => {
  const [brand, setBrand] = useState<BrandSettings>(emptyBrand);
  const [contact, setContact] = useState<ContactSettings>(emptyContact);
  const [homepage, setHomepage] = useState<HomepageSettings>(emptyHomepage);
  const [policies, setPolicies] = useState<PoliciesSettings>(emptyPolicies);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const bundle = await contentService.getPublicSettings();
      if (bundle.brand) setBrand((p) => ({ ...p, ...bundle.brand }));
      if (bundle.contact) setContact((p) => ({ ...p, ...bundle.contact }));
      if (bundle.homepage) setHomepage((p) => ({ ...p, ...bundle.homepage }));
      if (bundle.policies) setPolicies((p) => ({ ...p, ...bundle.policies }));
    } catch {
      // Keep defaults on failure
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  const whatsappPhone: SettingsPhoneEntry | undefined =
    contact.phones.find((p) => p.label.toLowerCase().includes("whatsapp")) ??
    contact.phones[0];

  const primaryEmail: SettingsEmailEntry | undefined = contact.emails[0];

  return (
    <SettingsContext.Provider
      value={{
        brand,
        contact,
        homepage,
        policies,
        isLoading,
        refreshSettings,
        whatsappNumber: whatsappPhone?.value ?? "",
        phoneNumber: contact.phones[0]?.value ?? "",
        emailAddress: primaryEmail?.value ?? "",
        socialLinks: contact.socialLinks ?? [],
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSiteSettings must be used within SettingsProvider");
  }
  return context;
};
