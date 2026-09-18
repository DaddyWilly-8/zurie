import { fundTransferService } from "@/services/transactions/transaction.service";
import type { FundTransferForm } from "./types";

export const fundTransferActions = {
  list(page: number, pageSize: number) {
    return fundTransferService.list({ page, pageSize });
  },

  create(form: FundTransferForm) {
    return fundTransferService.create({
      creditLedgerId: Number(form.creditLedgerId),
      ...(form.transactionDate
        ? { transactionDate: form.transactionDate }
        : {}),
      reference: form.reference || undefined,
      narration: form.narration || undefined,
      items: form.items
        .filter((line) => line.debitLedgerId !== "" && Number(line.amount) > 0)
        .map((line) => ({
          debitLedgerId: Number(line.debitLedgerId),
          amount: Number(line.amount),
        })),
    });
  },

  remove(id: number) {
    return fundTransferService.remove(id);
  },
};
