export type { Expense } from "@/services/expenses/expense.service";

/** Form values as typed — the amount is in the admin's selected currency. */
export type ExpenseForm = {
  category: string;
  amount: string;
  paymentMethod: "cash" | "bank";
  description: string;
  costCenterId: string;
};

export const emptyExpenseForm: ExpenseForm = {
  category: "",
  amount: "",
  paymentMethod: "cash",
  description: "",
  costCenterId: "",
};
