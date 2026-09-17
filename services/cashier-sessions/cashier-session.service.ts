import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export type CashierSession = {
  id: number;
  outletId: number;
  openedBy: number;
  openingBalance: number;
  closedBy: number | null;
  closingBalance: number | null;
  expectedClosingBalance: number | null;
  variance: number | null;
  status: "open" | "closed";
  openedAt: string;
  closedAt: string | null;
};

export type CashierSessionListResponse = {
  success: boolean;
  data: CashierSession[];
  meta: { count: number; page: number; pageSize: number };
};

export const cashierSessionService = {
  list(params: { page: number; pageSize: number }) {
    return apiClient.get<CashierSessionListResponse>(
      API_ENDPOINTS.cashierSessions.list,
      { query: params },
    );
  },

  /** Throws (404-ish ApiError) if the outlet has no open session — callers treat that as "no active session." */
  current(outletId: number) {
    return apiClient
      .get<{ data: CashierSession }>(API_ENDPOINTS.cashierSessions.current, {
        query: { outletId },
      })
      .then((response) => response.data);
  },

  open(outletId: number, openingBalance: number) {
    return apiClient.post<{ data: CashierSession }>(
      API_ENDPOINTS.cashierSessions.open,
      { outletId, openingBalance },
    );
  },

  close(id: number, closingBalance: number) {
    return apiClient.post<{ data: CashierSession }>(
      API_ENDPOINTS.cashierSessions.close(id),
      { closingBalance },
    );
  },
};
