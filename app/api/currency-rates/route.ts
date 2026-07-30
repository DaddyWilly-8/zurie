import { NextResponse } from "next/server";
import {
  DEFAULT_USD_EXCHANGE_RATE,
  normalizeExchangeRates,
  type CurrencyRateMap,
} from "@/utils/currency";

const SOURCE_URL = "https://open.er-api.com/v6/latest/USD";

type ProviderResponse = {
  result?: string;
  rates?: Record<string, number>;
};

const pickSupportedRates = (
  payload?: ProviderResponse,
): CurrencyRateMap => {
  const rates = payload?.rates;
  if (!rates) {
    return DEFAULT_USD_EXCHANGE_RATE;
  }

  return normalizeExchangeRates({
    USD: rates.USD,
    TZS: rates.TZS,
    EUR: rates.EUR,
    GBP: rates.GBP,
    KES: rates.KES,
  });
};

export async function GET() {
  try {
    const response = await fetch(SOURCE_URL, {
      method: "GET",
      next: { revalidate: 60 * 30 },
    });

    if (!response.ok) {
      return NextResponse.json({
        rates: DEFAULT_USD_EXCHANGE_RATE,
        source: "fallback",
      });
    }

    const payload = (await response.json()) as ProviderResponse;

    return NextResponse.json({
      rates: pickSupportedRates(payload),
      source: payload.result === "success" ? "live" : "fallback",
    });
  } catch {
    return NextResponse.json({
      rates: DEFAULT_USD_EXCHANGE_RATE,
      source: "fallback",
    });
  }
}
