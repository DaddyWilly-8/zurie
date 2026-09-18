export type {
  FundTransfer,
  FundTransferItem,
} from "@/services/transactions/transaction.service";

export type FundTransferLineForm = {
  debitLedgerId: number | "";
  amount: string;
};

export type FundTransferForm = {
  creditLedgerId: number | "";
  transactionDate: string;
  reference: string;
  narration: string;
  items: FundTransferLineForm[];
};

export const emptyFundTransferLine: FundTransferLineForm = {
  debitLedgerId: "",
  amount: "",
};

export const emptyFundTransferForm: FundTransferForm = {
  creditLedgerId: "",
  transactionDate: "",
  reference: "",
  narration: "",
  items: [{ ...emptyFundTransferLine }],
};
