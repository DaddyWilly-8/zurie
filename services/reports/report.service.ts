import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

/** Backend returns this keyed by order source (e.g. "pos", "online"), not an array. */
export type SalesByChannel = Record<string, { count: number; total: number }>;

export type LowStockRow = {
  productId: number;
  productName: string;
  quantity: number;
};

export type RevenueSummary = {
  grossSales: number;
  salesDiscounts: number;
  netSales: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
};

export type BalanceSheetLine = {
  ledgerId: number;
  name: string;
  code: string;
  balance: number;
};

export type BalanceSheetSection = {
  total: number;
  groups: Record<string, BalanceSheetLine[]>;
};

export type BalanceSheet = {
  assets: BalanceSheetSection;
  liabilities: BalanceSheetSection;
  equity: BalanceSheetSection & { retainedEarnings: number };
  isBalanced: boolean;
};

export type TrialBalanceRow = {
  ledgerId: number;
  name: string;
  code: string;
  groupName: string;
  debit: number;
  credit: number;
};

export type InventoryValueLine = {
  productId: number;
  productName: string;
  outletId: number;
  quantity: number;
  buyingPrice: number;
  value: number;
};

export type InventoryValueReport = {
  totalValue: number;
  lines: InventoryValueLine[];
};

export type DebtorRow = {
  stakeholderId: number;
  name: string;
  billed: number;
  received: number;
  outstanding: number;
};

export type CreditorRow = {
  stakeholderId: number;
  name: string;
  outstanding: number;
};

export type PurchaseSummary = {
  purchaseOrders: Record<string, { count: number; total: number }>;
  deliveriesReceived: number;
};

export type StoreStockRow = {
  productId: number;
  productName: string;
  quantity: number;
  stockStatus: string;
};

export const reportService = {
  salesByChannel() {
    return apiClient
      .get<{ data: SalesByChannel }>(API_ENDPOINTS.reports.salesByChannel)
      .then((response) => response.data);
  },

  lowStock() {
    return apiClient
      .get<{ data: LowStockRow[] }>(API_ENDPOINTS.reports.lowStock)
      .then((response) => response.data);
  },

  revenueSummary() {
    return apiClient
      .get<{ data: RevenueSummary }>(API_ENDPOINTS.reports.revenueSummary)
      .then((response) => response.data);
  },

  balanceSheet() {
    return apiClient
      .get<{ data: BalanceSheet }>(API_ENDPOINTS.reports.balanceSheet)
      .then((response) => response.data);
  },

  trialBalance() {
    return apiClient
      .get<{ data: TrialBalanceRow[] }>(API_ENDPOINTS.reports.trialBalance)
      .then((response) => response.data);
  },

  inventoryValue(outletId?: number) {
    return apiClient
      .get<{ data: InventoryValueReport }>(
        API_ENDPOINTS.reports.inventoryValue,
        outletId ? { query: { outletId } } : undefined,
      )
      .then((response) => response.data);
  },

  debtors() {
    return apiClient
      .get<{ data: DebtorRow[] }>(API_ENDPOINTS.reports.debtors)
      .then((response) => response.data);
  },

  creditors() {
    return apiClient
      .get<{ data: CreditorRow[] }>(API_ENDPOINTS.reports.creditors)
      .then((response) => response.data);
  },

  purchaseSummary() {
    return apiClient
      .get<{ data: PurchaseSummary }>(API_ENDPOINTS.reports.purchaseSummary)
      .then((response) => response.data);
  },

  storeStock(outletId: number) {
    return apiClient
      .get<{ data: StoreStockRow[] }>(
        API_ENDPOINTS.reports.storeStock(outletId),
      )
      .then((response) => response.data);
  },
};
