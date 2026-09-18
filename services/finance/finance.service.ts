import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export type Ledger = {
  id: number;
  name: string;
  code: string;
  openingBalance: number;
  currentBalance: number;
  isSystem: boolean;
};

export type LedgerGroup = {
  id: number;
  name: string;
  code: string;
  nature: string;
  isSystem: boolean;
  // Optional, not just possibly-empty — see flattenLedgers()'s walk()
  // for why a nested group's own relations can be missing entirely.
  children?: LedgerGroup[];
  ledgers?: Ledger[];
};

export const financeService = {
  chartOfAccounts() {
    return apiClient
      .get<{ data: LedgerGroup[] }>(API_ENDPOINTS.finance.chartOfAccounts)
      .then((response) => response.data);
  },
};

/**
 * Flattens the nested chart of accounts into a flat, pickable list —
 * every Transaction subtype form (Payment/Receipt/Journal Voucher/Fund
 * Transfer) needs a plain "pick a ledger" dropdown, not the tree.
 */
export const flattenLedgers = (
  groups: LedgerGroup[],
): Array<Ledger & { groupName: string }> => {
  const result: Array<Ledger & { groupName: string }> = [];

  const walk = (group: LedgerGroup) => {
    // The backend's chartOfAccounts() only eager-loads one level of
    // nested `children` (with(['children.ledgers', 'ledgers'])) — a
    // second-level group's own `children`/`ledgers` relation is never
    // loaded, so Laravel's whenLoaded() omits the key entirely from the
    // JSON rather than returning an empty array. Defaulting to [] here
    // is what actually matches the real response shape, not a
    // defensive-programming nicety.
    for (const ledger of group.ledgers ?? []) {
      result.push({ ...ledger, groupName: group.name });
    }
    for (const child of group.children ?? []) {
      walk(child);
    }
  };

  for (const group of groups) {
    walk(group);
  }

  return result;
};
