import type { CartItem } from "@/types/product";
import {
  DEFAULT_USD_EXCHANGE_RATE,
  formatUsdPriceInCurrency,
  type CurrencyCode,
  type CurrencyRateMap,
} from "@/utils/currency";

export const buildWhatsAppOrderMessage = (args: {
  customerName: string;
  customerPhone?: string;
  items: CartItem[];
  total: number;
  currency: CurrencyCode;
  rates?: Partial<CurrencyRateMap>;
}) => {
  const lines = args.items.map(
    (item, index) =>
      `${index + 1}. ${item.product.name} x${item.quantity} - ${formatUsdPriceInCurrency(item.product.price * item.quantity, args.currency, args.rates ?? DEFAULT_USD_EXCHANGE_RATE)}`,
  );

  return [
    "Hello Zuriè, I'd like to place an order:",
    `Customer: ${args.customerName}`,
    args.customerPhone ? `Phone: ${args.customerPhone}` : null,
    "",
    "Items:",
    ...lines,
    "",
    `Total: ${formatUsdPriceInCurrency(args.total, args.currency, args.rates ?? DEFAULT_USD_EXCHANGE_RATE)}`,
    "",
    "Please guide me on payment and delivery.",
  ]
    .filter(Boolean)
    .join("\n");
};

export const buildWhatsAppCheckoutLink = (number: string, message: string) => {
  const normalized = number.replace(/\D/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
};
