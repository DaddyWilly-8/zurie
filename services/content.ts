import { contentService } from "@/services/content/content.service";
import type { BrandContent, ContactInfo, Testimonial } from "@/types/content";

const defaultBrandContent: BrandContent = {
  heroTitle: "Carry Confidence. Wear Elegance.",
  heroSubtitle:
    "Discover elevated handbags designed for modern women who move with style and purpose.",
  heroImage: "/images/hero/zurie-hero.png",
  story:
    "Zuriè was founded to create handbags that blend timeless design, premium materials, and everyday functionality.",
  mission:
    "To empower women with elegant accessories that elevate every moment.",
  vision:
    "To become Africa's leading modern luxury handbag house loved globally.",
  qualityCommitment:
    "Every Zuriè piece is crafted with meticulous detail, durable materials, and premium finishing standards.",
};

const defaultContactInfo: ContactInfo = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "255718752434",
  phone: "+254 718 752 434",
  email: "hello@zurie.co.tz",
  address: "Dar es Salaam, Tanzania",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=Dar+es+Salaam&t=&z=13&ie=UTF8&iwloc=&output=embed",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  tiktok: "https://tiktok.com",
};

export const defaultTestimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Amina K.",
    quote:
      "The finishing is immaculate. My Zuriè bag instantly elevates every outfit.",
    location: "Nairobi",
  },
  {
    id: "t2",
    name: "Chantal M.",
    quote: "Minimal, elegant, and incredibly practical. Exactly what I wanted.",
    location: "Kigali",
  },
  {
    id: "t3",
    name: "Lerato P.",
    quote:
      "Luxury feel without compromise. Packaging and quality were flawless.",
    location: "Johannesburg",
  },
];

export const getBrandContent = async (): Promise<BrandContent> => {
  try {
    return await contentService.getBrandContent();
  } catch {
    return defaultBrandContent;
  }
};

export const getContactInfo = async (): Promise<ContactInfo> => {
  try {
    return await contentService.getContactInfo();
  } catch {
    return defaultContactInfo;
  }
};

export const getHomepageContent = async (): Promise<Record<string, unknown> | null> => {
  try {
    return (await contentService.getHomepageSettings()) as Record<string, unknown>;
  } catch {
    return null;
  }
};
