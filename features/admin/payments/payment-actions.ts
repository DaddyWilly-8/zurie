import { paymentService } from "@/services/transactions/transaction.service";
import type { PaymentForm } from "./types";

export const paymentActions = {
  list(page: number, pageSize: number) {
    return paymentService.list({ page, pageSize });
  },

  create(form: PaymentForm) {
    return paymentService.create({
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
    return paymentService.remove(id);
  },
};
