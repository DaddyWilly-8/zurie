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

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: "USD",
      rates: DEFAULT_USD_EXCHANGE_RATE,
      ratesSource: "fallback",
      setCurrency: (currency) => set({ currency }),
      refreshRates: async () => {
        try {
          const response = await fetch("/api/currency-rates", {
            method: "GET",
            cache: "no-store",
          });

          if (!response.ok) {
            return;
          }

          const payload = (await response.json()) as {
            rates?: Partial<CurrencyRateMap>;
            source?: "fallback" | "live";
          };

          set({
            rates: normalizeExchangeRates(payload.rates),
            ratesSource: payload.source === "live" ? "live" : "fallback",
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
