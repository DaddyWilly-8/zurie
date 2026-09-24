import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { withIdempotency } from "@/services/api/idempotency";

/** Shape of Expense\Resources\ExpenseResource on the backend. */
export type Expense = {
  id: number;
  category: string;
  /** TZS. */
  amount: number;
  paymentMethod: "cash" | "bank" | null;
  description: string | null;
  costCenterId: number | null;
  createdAt: string;
};

export type ExpensePayload = {
  category: string;
  /** TZS — convert from the display currency before calling. */
  amount: number;
  paymentMethod: "cash" | "bank";
  description?: string;
  costCenterId?: number | null;
};

export const expenseService = {
  list(params: { page: number; pageSize: number }) {
    return apiClient
      .get<{ data?: Expense[]; meta?: { count?: number } }>(
        API_ENDPOINTS.expenses.adminList,
        { query: params },
      )
      .then((response) => ({
        data: response.data ?? [],
        count: response.meta?.count ?? 0,
      }));
  },

  /** Posts to the ledger, so it carries an Idempotency-Key like other money POSTs. */
  create(payload: ExpensePayload) {
    return withIdempotency("expense-create", payload, (headers) =>
      apiClient.post<{ data: Expense }>(
        API_ENDPOINTS.expenses.adminList,
        payload,
        {
          headers,
        },
      ),
    );
  },
};
