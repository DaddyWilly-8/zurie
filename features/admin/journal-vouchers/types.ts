export type {
  JournalVoucher,
  JournalVoucherItem,
} from "@/services/transactions/transaction.service";

export type JournalVoucherLineForm = {
  debitLedgerId: number | "";
  creditLedgerId: number | "";
  amount: string;
};

export type JournalVoucherForm = {
  transactionDate: string;
  reference: string;
  narration: string;
  items: JournalVoucherLineForm[];
};

export const emptyJournalVoucherLine: JournalVoucherLineForm = {
  debitLedgerId: "",
  creditLedgerId: "",
  amount: "",
};

export const emptyJournalVoucherForm: JournalVoucherForm = {
  transactionDate: "",
  reference: "",
  narration: "",
  items: [{ ...emptyJournalVoucherLine }],
};
