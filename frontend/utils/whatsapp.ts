// utils/whatsapp.ts
import type { CartItem } from "@/types/product";
import {
  DEFAULT_USD_EXCHANGE_RATE,
  formatBaseCurrencyInCurrency,
  type CurrencyCode,
  type CurrencyRateMap,
} from "@/utils/currency";

type BuildWhatsAppOrderMessageArgs = {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  items: CartItem[];
  total: number;
  currency: CurrencyCode;
  rates?: Partial<CurrencyRateMap>;
  contactMethod?: "whatsapp" | "email" | "phone";
};

export const buildWhatsAppOrderMessage = (
  args: BuildWhatsAppOrderMessageArgs,
) => {
  const itemsList = args.items.map(
    (item, index) =>
      `${index + 1}. ${item.product.name} x${item.quantity} - ${formatBaseCurrencyInCurrency(item.product.price * item.quantity, args.currency, args.rates ?? DEFAULT_USD_EXCHANGE_RATE)}`,
  );

  const lines = [
    "Hello Zuriè, I'd like to place an order:",
    `Customer: ${args.customerName}`,
    args.customerPhone ? `Phone: ${args.customerPhone}` : null,
    args.customerEmail ? `Email: ${args.customerEmail}` : null,
    args.contactMethod
      ? `Contact Method: ${args.contactMethod.charAt(0).toUpperCase() + args.contactMethod.slice(1)}`
      : null,
    "",
    "Items:",
    ...itemsList,
    "",
    `Total: ${formatBaseCurrencyInCurrency(args.total, args.currency, args.rates ?? DEFAULT_USD_EXCHANGE_RATE)}`,
    "",
    "Please guide me on payment and delivery.",
  ]
    .filter(Boolean)
    .join("\n");

  return lines;
};

export const buildWhatsAppCheckoutLink = (number: string, message: string) => {
  const normalized = number.replace(/\D/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
};
