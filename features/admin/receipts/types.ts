export type {
  Receipt,
  ReceiptItem,
} from "@/services/transactions/transaction.service";

export type ReceiptLineForm = {
  creditLedgerId: number | "";
  amount: string;
};

export type ReceiptForm = {
  debitLedgerId: number | "";
  transactionDate: string;
  reference: string;
  narration: string;
  items: ReceiptLineForm[];
};

export const emptyReceiptLine: ReceiptLineForm = {
  creditLedgerId: "",
  amount: "",
};

export const emptyReceiptForm: ReceiptForm = {
  debitLedgerId: "",
  transactionDate: "",
  reference: "",
  narration: "",
  items: [{ ...emptyReceiptLine }],
};
