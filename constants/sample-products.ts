import type { Product } from "@/types/product";

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "p1",
    slug: "aurelia-structured-top-handle",
    name: "Aurelia Structured Top Handle",
    description:
      "A refined structured handbag with polished hardware and premium vegan leather finish.",
    price: 220,
    category: "handbags",
    featured: true,
    bestSeller: true,
    newArrival: false,
    inStock: true,
    stockCount: 13,
    specifications: [
      "Vegan leather",
      "Gold-tone clasp",
      "Microfiber lining",
      "Detachable strap",
    ],
    colors: [
      { name: "Noir", hex: "#1f1f1f" },
      { name: "Ivory", hex: "#f5f1e8" },
    ],
    sizes: ["One Size"],
    images: [
      {
        url: "/images/products/aurelia-1.png",
        alt: "Aurelia bag front",
        isPrimary: true,
      },
      { url: "/images/products/aurelia-2.png", alt: "Aurelia bag side" },
      {
        url: "/images/products/aurelia-3.png",
        alt: "Aurelia bag strap detail",
      },
    ],
  },
  {
    id: "p2",
    slug: "serene-city-tote",
    name: "Serene City Tote",
    description:
      "A spacious minimalist tote designed for elegant daily carry and work essentials.",
    price: 195,
    category: "tote-bags",
    featured: true,
    bestSeller: false,
    newArrival: true,
    inStock: true,
    stockCount: 8,
    specifications: [
      "Pebbled texture",
      "Zip closure",
      "Laptop sleeve",
      "Reinforced handles",
    ],
    colors: [
      { name: "Sand", hex: "#d6c2a8" },
      { name: "Black", hex: "#1e1e1e" },
    ],
    sizes: ["One Size"],
    images: [
      {
        url: "/images/products/serene-1.png",
        alt: "Serene tote on model",
        isPrimary: true,
      },
      { url: "/images/products/serene-2.png", alt: "Serene tote closeup" },
    ],
  },
  {
    id: "p3",
    slug: "luna-crossbody-mini",
    name: "Luna Crossbody Mini",
    description:
      "Compact crossbody silhouette with smooth curved lines and signature hardware.",
    price: 160,
    category: "crossbody-bags",
    featured: false,
    bestSeller: true,
    newArrival: true,
    inStock: true,
    stockCount: 16,
    specifications: [
      "Magnetic flap",
      "Gold logo",
      "Adjustable strap",
      "Two interior pockets",
    ],
    colors: [
      { name: "Olive", hex: "#8e8a66" },
      { name: "Tan", hex: "#bd9f82" },
    ],
    sizes: ["One Size"],
    images: [
      {
        url: "/images/products/luna-1.png",
        alt: "Luna crossbody front",
        isPrimary: true,
      },
      { url: "/images/products/luna-2.png", alt: "Luna crossbody styling" },
    ],
  },
  {
    id: "p4",
    slug: "celeste-shoulder-bag",
    name: "Celeste Shoulder Bag",
    description:
      "A soft-structured shoulder bag with understated lines and elevated materials.",
    price: 210,
    category: "shoulder-bags",
    featured: false,
    bestSeller: false,
    newArrival: true,
    inStock: false,
    stockCount: 0,
    specifications: [
      "Italian-inspired silhouette",
      "Suede-touch lining",
      "Polished feet",
      "Dust bag included",
    ],
    colors: [
      { name: "Mocha", hex: "#7a5b47" },
      { name: "Cream", hex: "#efe6db" },
    ],
    sizes: ["One Size"],
    images: [
      {
        url: "/images/products/celeste-1.png",
        alt: "Celeste shoulder bag",
        isPrimary: true,
      },
      {
        url: "/images/products/celeste-2.png",
        alt: "Celeste shoulder bag details",
      },
    ],
  },
  {
    id: "p5",
    slug: "nova-commuter-backpack",
    name: "Nova Commuter Backpack",
    description:
      "Premium commuter backpack balancing femininity, utility, and streamlined design.",
    price: 230,
    category: "backpacks",
    featured: true,
    bestSeller: false,
    newArrival: false,
    inStock: true,
    stockCount: 5,
    specifications: [
      "Water-resistant finish",
      "Padded back panel",
      "Metal zip pulls",
      "Tablet compartment",
    ],
    colors: [
      { name: "Onyx", hex: "#222222" },
      { name: "Stone", hex: "#b8aca0" },
    ],
    sizes: ["One Size"],
    images: [
      {
        url: "/images/products/nova-1.png",
        alt: "Nova backpack full view",
        isPrimary: true,
      },
      { url: "/images/products/nova-2.png", alt: "Nova backpack in use" },
    ],
  },
  {
    id: "p6",
    slug: "aria-signature-wallet",
    name: "Aria Signature Wallet",
    description:
      "Elegant wallet with slim profile, crafted for daily essentials and travel ease.",
    price: 95,
    category: "wallets",
    featured: false,
    bestSeller: true,
    newArrival: false,
    inStock: true,
    stockCount: 21,
    specifications: [
      "RFID shielding",
      "8 card slots",
      "Coin zip pocket",
      "Snap closure",
    ],
    colors: [
      { name: "Bordeaux", hex: "#5d2834" },
      { name: "Nude", hex: "#d5bca2" },
    ],
    sizes: ["One Size"],
    images: [
      {
        url: "/images/products/aria-1.png",
        alt: "Aria wallet flat lay",
        isPrimary: true,
      },
      { url: "/images/products/aria-2.png", alt: "Aria wallet open view" },
    ],
  },
];
