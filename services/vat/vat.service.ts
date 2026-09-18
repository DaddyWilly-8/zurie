import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export type VatTransaction = {
  id: number;
  type: "input" | "output";
  vatableType: string;
  vatableId: number;
  amount: number;
  createdAt: string;
};

export type VatTransactionListResponse = {
  success: boolean;
  data: VatTransaction[];
  meta: { count: number; page: number; pageSize: number };
};

export type VatSummary = {
  input: number;
  output: number;
  net: number;
};

export const vatService = {
  list(params: { page: number; pageSize: number; type?: "input" | "output" }) {
    return apiClient.get<VatTransactionListResponse>(
      API_ENDPOINTS.vatTransactions.list,
      { query: params },
    );
  },

  summary(params?: { from?: string; to?: string }) {
    return apiClient
      .get<{ data: VatSummary }>(API_ENDPOINTS.vatTransactions.summary, {
        query: params,
      })
      .then((response) => response.data);
  },
};
