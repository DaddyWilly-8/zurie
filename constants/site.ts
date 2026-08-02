export const SITE = {
  name: "Zuriè",
  displayName: "Zuriè",
  legalName: "Zuriè Luxury Handbags",
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
  { label: "Your Bag", href: "/cart" },
];
