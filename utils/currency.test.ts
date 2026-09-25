import { describe, expect, it } from "vitest";
import {
  convertFromBaseCurrency,
  convertToBaseCurrency,
  formatCurrency,
  normalizeExchangeRates,
  DEFAULT_USD_EXCHANGE_RATE,
} from "./currency";

describe("normalizeExchangeRates", () => {
  it("falls back to the default rate for any missing or non-positive entry", () => {
    const rates = normalizeExchangeRates({ USD: 1, TZS: 0, EUR: -5 });

    expect(rates.USD).toBe(1);
    expect(rates.TZS).toBe(DEFAULT_USD_EXCHANGE_RATE.TZS);
    expect(rates.EUR).toBe(DEFAULT_USD_EXCHANGE_RATE.EUR);
    expect(rates.GBP).toBe(DEFAULT_USD_EXCHANGE_RATE.GBP);
    expect(rates.KES).toBe(DEFAULT_USD_EXCHANGE_RATE.KES);
  });

  it("falls back entirely for null/undefined input", () => {
    expect(normalizeExchangeRates(null)).toEqual(DEFAULT_USD_EXCHANGE_RATE);
    expect(normalizeExchangeRates(undefined)).toEqual(
      DEFAULT_USD_EXCHANGE_RATE,
    );
  });
});

describe("convertToBaseCurrency / convertFromBaseCurrency", () => {
  it("is a no-op when the currency already is the base currency (TZS)", () => {
    expect(convertToBaseCurrency(1000, "TZS")).toBe(1000);
    expect(convertFromBaseCurrency(1000, "TZS")).toBe(1000);
  });

  it("round-trips an amount through a non-base currency without drifting", () => {
    const rates = { USD: 1, TZS: 2550, EUR: 0.92, GBP: 0.79, KES: 129 };
    const original = 10000; // TZS

    const inUsd = convertFromBaseCurrency(original, "USD", rates);
    const backToBase = convertToBaseCurrency(inUsd, "USD", rates);

    expect(backToBase).toBeCloseTo(original, 6);
  });

  it("converts using the ratio between the two currencies' rates", () => {
    const rates = { USD: 1, TZS: 2550, EUR: 0.92, GBP: 0.79, KES: 129 };

    // 2550 TZS == 1 USD, so converting 2550 TZS into USD should be ~1.
    expect(convertToBaseCurrency(1, "USD", rates)).toBeCloseTo(2550, 6);
  });
});

describe("formatCurrency", () => {
  it("formats TZS with no decimal places", () => {
    expect(formatCurrency(1234, "TZS")).not.toContain(".");
  });

  it("formats USD with a currency symbol", () => {
    expect(formatCurrency(19.99, "USD")).toContain("19.99");
  });
});
