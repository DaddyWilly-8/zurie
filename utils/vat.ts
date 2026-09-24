import type { TaxSettings } from "@/types/content";

export type VatLine = {
  /** Line value in TZS (unit price x quantity). */
  amount: number;
  vatExempted?: boolean;
};

export type VatSummary = {
  /** Sum of the line values, as the prices were entered. */
  subtotal: number;
  /** Coupon discount applied (TZS), 0 if none. */
  discount: number;
  vat: number;
  /** What the customer pays. */
  total: number;
};

const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Mirrors the backend's OrderService::vatPerLine(), so the cart/POS shows
 * the same VAT and total checkout will charge. An optional coupon
 * `discount` (TZS) is shared across lines in proportion to their value
 * (the last line takes the rounding remainder) and VAT is computed on the
 * discounted value: VAT-inclusive prices contain their VAT
 * (value x rate / (100 + rate)); otherwise it's added on top
 * (value x rate / 100). Exempt lines carry none. Rounded per line, like
 * the backend.
 */
export const summarizeVat = (
  lines: VatLine[],
  { vatPercentage, pricesIncludeVat }: TaxSettings,
  discount = 0,
): VatSummary => {
  const subtotal = round2(lines.reduce((sum, line) => sum + line.amount, 0));
  let discountLeft = discount;

  const vat = round2(
    lines.reduce((sum, line, index) => {
      const isLast = index === lines.length - 1;
      const lineDiscount =
        isLast || subtotal <= 0
          ? discountLeft
          : round2((discount * line.amount) / subtotal);
      discountLeft -= lineDiscount;

      if (line.vatExempted || vatPercentage <= 0) return sum;
      const taxable = Math.max(0, line.amount - lineDiscount);
      return (
        sum +
        round2(
          pricesIncludeVat
            ? (taxable * vatPercentage) / (100 + vatPercentage)
            : (taxable * vatPercentage) / 100,
        )
      );
    }, 0),
  );

  const afterDiscount = round2(subtotal - discount);

  return {
    subtotal,
    discount: round2(discount),
    vat,
    total: pricesIncludeVat ? afterDiscount : round2(afterDiscount + vat),
  };
};
