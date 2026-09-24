import { costCenterService } from "@/services/cost-centers/cost-center.service";
import { expenseService } from "@/services/expenses/expense.service";
import {
  convertToBaseCurrency,
  type CurrencyCode,
  type CurrencyRateMap,
} from "@/utils/currency";
import type { ExpenseForm } from "./types";

export const expenseActions = {
  pageSize: 20,

  list(page: number) {
    return expenseService.list({ page, pageSize: this.pageSize });
  },

  costCenters() {
    return costCenterService.list();
  },

  /** Amount is typed in the selected currency; the ledger is in TZS. */
  create(form: ExpenseForm, currency: CurrencyCode, rates: CurrencyRateMap) {
    return expenseService.create({
      category: form.category.trim(),
      amount:
        Math.round(
          convertToBaseCurrency(Number(form.amount), currency, rates) * 100,
        ) / 100,
      paymentMethod: form.paymentMethod,
      description: form.description.trim() || undefined,
      costCenterId: form.costCenterId ? Number(form.costCenterId) : null,
    });
  },
};
