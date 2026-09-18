export type {
  Payment,
  PaymentItem,
} from "@/services/transactions/transaction.service";

export type PaymentLineForm = {
  debitLedgerId: number | "";
  amount: string;
};

export type PaymentForm = {
  creditLedgerId: number | "";
  transactionDate: string;
  reference: string;
  narration: string;
  items: PaymentLineForm[];
};

export const emptyPaymentLine: PaymentLineForm = {
  debitLedgerId: "",
  amount: "",
};

export const emptyPaymentForm: PaymentForm = {
  creditLedgerId: "",
  transactionDate: "",
  reference: "",
  narration: "",
  items: [{ ...emptyPaymentLine }],
};
