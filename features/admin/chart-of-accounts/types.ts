export type {
  LedgerGroup,
  Ledger,
  LedgerGroupNature,
} from "@/services/finance/finance.service";
import type { LedgerGroupNature } from "@/services/finance/finance.service";

export type LedgerGroupForm = {
  name: string;
  code: string;
  nature: LedgerGroupNature | "";
  parentId: number | "";
};

export const emptyLedgerGroupForm: LedgerGroupForm = {
  name: "",
  code: "",
  nature: "",
  parentId: "",
};

export type LedgerForm = {
  ledgerGroupId: number | "";
  name: string;
  code: string;
  openingBalance: number | "";
  isContra: boolean;
};

export const emptyLedgerForm: LedgerForm = {
  ledgerGroupId: "",
  name: "",
  code: "",
  openingBalance: "",
  isContra: false,
};
