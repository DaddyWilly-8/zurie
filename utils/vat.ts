import type { TaxSettings } from "@/types/content";

export type VatLine = {
  /** Line value in TZS (unit price x quantity). */
  amount: number;
  vatExempted?: boolean;
};

export type VatSummary = {
  /** Sum of the line values, as the prices were entered. */
  subtotal: number;
  vat: number;
  /** What the customer pays. */
  total: number;
};

const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Mirrors the backend's OrderService::vatPerLine() for a cart without a
 * coupon, so the cart/POS shows the same VAT checkout will charge:
 * VAT-inclusive prices contain their VAT (amount x rate / (100 + rate));
 * otherwise it's added on top (amount x rate / 100). Exempt lines carry
 * none. Rounded per line, like the backend.
 */
export const summarizeVat = (
  lines: VatLine[],
  { vatPercentage, pricesIncludeVat }: TaxSettings,
): VatSummary => {
  const subtotal = round2(lines.reduce((sum, line) => sum + line.amount, 0));
  const vat = round2(
    lines.reduce((sum, line) => {
      if (line.vatExempted || vatPercentage <= 0) return sum;
      return (
        sum +
        round2(
          pricesIncludeVat
            ? (line.amount * vatPercentage) / (100 + vatPercentage)
            : (line.amount * vatPercentage) / 100,
        )
      );
    }, 0),
  );

  return {
    subtotal,
    vat,
    total: pricesIncludeVat ? subtotal : round2(subtotal + vat),
  };
};
