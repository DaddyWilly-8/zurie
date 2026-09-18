import { journalVoucherService } from "@/services/transactions/transaction.service";
import type { JournalVoucherForm } from "./types";

export const journalVoucherActions = {
  list(page: number, pageSize: number) {
    return journalVoucherService.list({ page, pageSize });
  },

  create(form: JournalVoucherForm) {
    return journalVoucherService.create({
      ...(form.transactionDate
        ? { transactionDate: form.transactionDate }
        : {}),
      reference: form.reference || undefined,
      narration: form.narration || undefined,
      items: form.items
        .filter(
          (line) =>
            line.debitLedgerId !== "" &&
            line.creditLedgerId !== "" &&
            Number(line.amount) > 0,
        )
        .map((line) => ({
          debitLedgerId: Number(line.debitLedgerId),
          creditLedgerId: Number(line.creditLedgerId),
          amount: Number(line.amount),
        })),
    });
  },

  remove(id: number) {
    return journalVoucherService.remove(id);
  },
};
