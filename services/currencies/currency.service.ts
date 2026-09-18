import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export type Currency = {
  id: number;
  name: string;
  namePlural: string;
  code: string;
  symbol: string;
  symbolNative: string;
  decimalDigits: number;
  isBase: boolean;
  isActive: boolean;
};

export type ExchangeRate = {
  id: number;
  currencyId: number;
  rateDatetime: string;
  rateToBaseCurrency: number;
};

export type CreateCurrencyPayload = {
  name: string;
  namePlural: string;
  code: string;
  symbol: string;
  symbolNative: string;
  decimalDigits?: number;
  isBase?: boolean;
};

export const currencyService = {
  list() {
    return apiClient
      .get<{ data: Currency[] }>(API_ENDPOINTS.currencies.list)
      .then((response) => response.data);
  },

  create(payload: CreateCurrencyPayload) {
    return apiClient.post<{ data: Currency }>(
      API_ENDPOINTS.currencies.list,
      payload,
    );
  },

  update(id: number, payload: Partial<CreateCurrencyPayload>) {
    return apiClient.patch<{ data: Currency }>(
      API_ENDPOINTS.currencies.byId(id),
      payload,
    );
  },

  setActive(id: number, isActive: boolean) {
    return apiClient.patch<{ data: Currency }>(
      API_ENDPOINTS.currencies.byId(id),
      { isActive },
    );
  },

  designateBase(id: number) {
    return apiClient.post<{ data: Currency }>(
      API_ENDPOINTS.currencies.designateBase(id),
    );
  },

  listExchangeRates(id: number) {
    return apiClient
      .get<{ data: ExchangeRate[] }>(API_ENDPOINTS.currencies.exchangeRates(id))
      .then((response) => response.data);
  },

  addExchangeRate(id: number, rateToBaseCurrency: number) {
    return apiClient.post<{ data: ExchangeRate }>(
      API_ENDPOINTS.currencies.exchangeRates(id),
      { rateToBaseCurrency },
    );
  },
};
