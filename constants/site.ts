export const SITE = {
  name: "Zurie",
  displayName: "Zurie",
  legalName: "Zurie Luxury Handbags",
  description:
    "Modern luxury handbags crafted for women who value elegance, quality, and timeless design.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/images/hero/og-zurie.png",
  locale: "en_US",
  currency: "USD",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "255718752434",
};

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
