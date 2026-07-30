"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  DEFAULT_USD_EXCHANGE_RATE,
  normalizeExchangeRates,
  type CurrencyCode,
  type CurrencyRateMap,
} from "@/utils/currency";

type CurrencyState = {
  currency: CurrencyCode;
  rates: CurrencyRateMap;
  ratesSource: "fallback" | "live";
  setCurrency: (currency: CurrencyCode) => void;
  refreshRates: () => Promise<void>;
};

const CURRENCY_RATE_SOURCE_URL = "https://open.er-api.com/v6/latest/USD";

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: "USD",
      rates: DEFAULT_USD_EXCHANGE_RATE,
      ratesSource: "fallback",
      setCurrency: (currency) => set({ currency }),
      refreshRates: async () => {
        try {
          const response = await fetch(CURRENCY_RATE_SOURCE_URL, {
            method: "GET",
            cache: "no-store",
          });

          if (!response.ok) {
            return;
          }

          const payload = (await response.json()) as {
            result?: string;
            rates?: Partial<CurrencyRateMap>;
          };

          set({
            rates: normalizeExchangeRates(payload.rates),
            ratesSource: payload.result === "success" ? "live" : "fallback",
          });
        } catch {
          // Keep persisted/fallback rates on request failures.
        }
      },
    }),
    {
      name: "zurie-currency-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
