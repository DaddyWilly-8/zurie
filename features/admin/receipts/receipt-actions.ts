import { receiptService } from "@/services/transactions/transaction.service";
import type { ReceiptForm } from "./types";

export const receiptActions = {
  list(page: number, pageSize: number) {
    return receiptService.list({ page, pageSize });
  },

  create(form: ReceiptForm) {
    return receiptService.create({
      debitLedgerId: Number(form.debitLedgerId),
      ...(form.transactionDate
        ? { transactionDate: form.transactionDate }
        : {}),
      reference: form.reference || undefined,
      narration: form.narration || undefined,
      items: form.items
        .filter((line) => line.creditLedgerId !== "" && Number(line.amount) > 0)
        .map((line) => ({
          creditLedgerId: Number(line.creditLedgerId),
          amount: Number(line.amount),
        })),
    });
  },

  remove(id: number) {
    return receiptService.remove(id);
  },
};
