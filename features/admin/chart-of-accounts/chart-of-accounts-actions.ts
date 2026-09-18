import { financeService } from "@/services/finance/finance.service";
import type { LedgerForm, LedgerGroupForm } from "./types";

export const chartOfAccountsActions = {
  list() {
    return financeService.chartOfAccounts();
  },

  createLedgerGroup(form: LedgerGroupForm) {
    return financeService.createLedgerGroup({
      name: form.name,
      code: form.code,
      nature: form.nature as Exclude<LedgerGroupForm["nature"], "">,
      parentId: form.parentId === "" ? null : form.parentId,
    });
  },

  updateLedgerGroup(id: number, form: LedgerGroupForm) {
    return financeService.updateLedgerGroup(id, {
      name: form.name,
      code: form.code,
      nature: form.nature as Exclude<LedgerGroupForm["nature"], "">,
      parentId: form.parentId === "" ? null : form.parentId,
    });
  },

  deleteLedgerGroup(id: number) {
    return financeService.deleteLedgerGroup(id);
  },

  createLedger(form: LedgerForm) {
    return financeService.createLedger({
      ledgerGroupId: form.ledgerGroupId as number,
      name: form.name,
      code: form.code,
      openingBalance:
        form.openingBalance === "" ? undefined : form.openingBalance,
      isContra: form.isContra,
    });
  },

  updateLedger(id: number, form: LedgerForm) {
    return financeService.updateLedger(id, {
      ledgerGroupId: form.ledgerGroupId as number,
      name: form.name,
      code: form.code,
    });
  },

  deleteLedger(id: number) {
    return financeService.deleteLedger(id);
  },
};
