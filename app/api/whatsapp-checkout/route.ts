import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SITE } from "@/constants/site";
import type { CartItem } from "@/types/product";
import { type CurrencyCode } from "@/utils/currency";
import {
  buildWhatsAppCheckoutLink,
  buildWhatsAppOrderMessage,
} from "@/utils/whatsapp";

const schema = z.object({
  customerName: z.string().min(2),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      product: z.object({
        name: z.string(),
        price: z.number(),
      }),
    }),
  ),
  total: z.number().positive(),
  currency: z.enum(["USD", "TZS", "EUR", "GBP", "KES"]).optional(),
});

type WhatsAppRequestPayload = z.infer<typeof schema>;

const toCartItems = (items: WhatsAppRequestPayload["items"]): CartItem[] => {
  return items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    product: {
      id: item.productId,
      slug: item.productId,
      name: item.product.name,
      description: "",
      price: item.product.price,
      category: "handbags",
      featured: false,
      bestSeller: false,
      newArrival: false,
      inStock: true,
      stockCount: item.quantity,
      specifications: [],
      colors: [],
      sizes: [],
      images: [],
    },
  }));
};

export async function POST(request: NextRequest) {
  try {
    const payload = schema.parse(await request.json());
    const message = buildWhatsAppOrderMessage({
      customerName: payload.customerName,
      items: toCartItems(payload.items),
      total: payload.total,
      currency: (payload.currency ?? SITE.currency) as CurrencyCode,
    });

    return NextResponse.json({
      checkoutUrl: buildWhatsAppCheckoutLink(SITE.whatsappNumber, message),
    });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
