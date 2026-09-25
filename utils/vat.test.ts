import { describe, expect, it } from "vitest";
import { summarizeVat } from "./vat";

describe("summarizeVat", () => {
  it("adds VAT on top when prices are VAT-exclusive", () => {
    const summary = summarizeVat([{ amount: 1000 }], {
      vatPercentage: 18,
      pricesIncludeVat: false,
    });

    expect(summary.subtotal).toBe(1000);
    expect(summary.vat).toBe(180);
    expect(summary.total).toBe(1180);
  });

  it("extracts VAT from an inclusive price instead of adding it", () => {
    // 1180 inclusive of 18% VAT contains exactly 180 of VAT — the total
    // the customer pays never changes for an inclusive price, only how
    // much of it is broken out as VAT.
    const summary = summarizeVat([{ amount: 1180 }], {
      vatPercentage: 18,
      pricesIncludeVat: true,
    });

    expect(summary.vat).toBe(180);
    expect(summary.total).toBe(1180);
  });

  it("charges no VAT on an exempt line", () => {
    const summary = summarizeVat([{ amount: 1000, vatExempted: true }], {
      vatPercentage: 18,
      pricesIncludeVat: false,
    });

    expect(summary.vat).toBe(0);
    expect(summary.total).toBe(1000);
  });

  it("charges no VAT when the configured rate is zero", () => {
    const summary = summarizeVat([{ amount: 1000 }], {
      vatPercentage: 0,
      pricesIncludeVat: false,
    });

    expect(summary.vat).toBe(0);
    expect(summary.total).toBe(1000);
  });

  it("spreads a coupon discount across lines in proportion to their value", () => {
    // Line A is 3x line B's value, so a 400 discount should split 300/100
    // — computed on the discounted (taxable) value, not the full price.
    const summary = summarizeVat(
      [{ amount: 3000 }, { amount: 1000 }],
      { vatPercentage: 18, pricesIncludeVat: false },
      400,
    );

    expect(summary.subtotal).toBe(4000);
    expect(summary.discount).toBe(400);
    // (3000-300)*0.18 + (1000-100)*0.18 = 486 + 162 = 648
    expect(summary.vat).toBe(648);
    expect(summary.total).toBe(4000 - 400 + 648);
  });

  it("never lets a discount push a line's taxable value below zero", () => {
    // A discount larger than a single exempt-adjacent line's value must
    // not produce negative VAT for that line.
    const summary = summarizeVat(
      [{ amount: 100 }],
      { vatPercentage: 18, pricesIncludeVat: false },
      500,
    );

    expect(summary.vat).toBe(0);
  });

  it("gives the last line the rounding remainder of a shared discount", () => {
    // Three equal-value lines splitting a discount that doesn't divide
    // evenly — every cent of the discount must still be accounted for
    // somewhere, which this mirrors by construction (discountLeft flows
    // entirely into the last line).
    const summary = summarizeVat(
      [{ amount: 100 }, { amount: 100 }, { amount: 100 }],
      { vatPercentage: 18, pricesIncludeVat: false },
      100,
    );

    expect(summary.discount).toBe(100);
    expect(summary.total).toBe(300 - 100 + summary.vat);
  });

  it("returns zero VAT and zero total for an empty cart", () => {
    const summary = summarizeVat([], {
      vatPercentage: 18,
      pricesIncludeVat: false,
    });

    expect(summary.subtotal).toBe(0);
    expect(summary.vat).toBe(0);
    expect(summary.total).toBe(0);
  });
});
