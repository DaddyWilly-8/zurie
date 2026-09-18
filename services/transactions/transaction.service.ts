import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

type ListResponse<T> = {
  success: boolean;
  data: T[];
  meta: { count: number; page: number; pageSize: number };
};

export type PaymentItem = {
  id: number;
  debitLedgerId: number;
  amount: number;
  journalEntryId: number;
};

export type Payment = {
  id: number;
  paymentNumber: string;
  transactionDate: string;
  reference: string | null;
  narration: string | null;
  creditLedgerId: number;
  totalAmount: number;
  items: PaymentItem[];
  createdAt: string;
};

export type CreatePaymentPayload = {
  transactionDate?: string;
  reference?: string;
  narration?: string;
  creditLedgerId: number;
  items: Array<{ debitLedgerId: number; amount: number }>;
};

export type ReceiptItem = {
  id: number;
  creditLedgerId: number;
  amount: number;
  journalEntryId: number;
};

export type Receipt = {
  id: number;
  receiptNumber: string;
  transactionDate: string;
  reference: string | null;
  narration: string | null;
  debitLedgerId: number;
  totalAmount: number;
  items: ReceiptItem[];
  sales: Array<{ orderId: number; amountApplied: number }>;
  createdAt: string;
};

export type CreateReceiptPayload = {
  transactionDate?: string;
  reference?: string;
  narration?: string;
  debitLedgerId: number;
  items: Array<{ creditLedgerId: number; amount: number }>;
  sales?: Array<{ orderId: number; amountApplied: number }>;
};

export type JournalVoucherItem = {
  id: number;
  debitLedgerId: number;
  creditLedgerId: number;
  amount: number;
  journalEntryId: number;
};

export type JournalVoucher = {
  id: number;
  voucherNumber: string;
  transactionDate: string;
  reference: string | null;
  narration: string | null;
  totalAmount: number;
  items: JournalVoucherItem[];
  createdAt: string;
};

export type CreateJournalVoucherPayload = {
  transactionDate?: string;
  reference?: string;
  narration?: string;
  items: Array<{
    debitLedgerId: number;
    creditLedgerId: number;
    amount: number;
  }>;
};

export type FundTransferItem = {
  id: number;
  debitLedgerId: number;
  amount: number;
  journalEntryId: number;
};

export type FundTransfer = {
  id: number;
  transferNumber: string;
  transactionDate: string;
  reference: string | null;
  narration: string | null;
  creditLedgerId: number;
  totalAmount: number;
  items: FundTransferItem[];
  createdAt: string;
};

export type CreateFundTransferPayload = {
  transactionDate?: string;
  reference?: string;
  narration?: string;
  creditLedgerId: number;
  items: Array<{ debitLedgerId: number; amount: number }>;
};

export const paymentService = {
  list(params: { page: number; pageSize: number }) {
    return apiClient.get<ListResponse<Payment>>(API_ENDPOINTS.payments.list, {
      query: params,
    });
  },
  create(payload: CreatePaymentPayload) {
    return apiClient.post<{ data: Payment }>(
      API_ENDPOINTS.payments.list,
      payload,
    );
  },
  remove(id: number) {
    return apiClient.delete<{ message: string }>(
      API_ENDPOINTS.payments.byId(id),
    );
  },
};

export const receiptService = {
  list(params: { page: number; pageSize: number }) {
    return apiClient.get<ListResponse<Receipt>>(API_ENDPOINTS.receipts.list, {
      query: params,
    });
  },
  create(payload: CreateReceiptPayload) {
    return apiClient.post<{ data: Receipt }>(
      API_ENDPOINTS.receipts.list,
      payload,
    );
  },
  remove(id: number) {
    return apiClient.delete<{ message: string }>(
      API_ENDPOINTS.receipts.byId(id),
    );
  },
};

export const journalVoucherService = {
  list(params: { page: number; pageSize: number }) {
    return apiClient.get<ListResponse<JournalVoucher>>(
      API_ENDPOINTS.journalVouchers.list,
      { query: params },
    );
  },
  create(payload: CreateJournalVoucherPayload) {
    return apiClient.post<{ data: JournalVoucher }>(
      API_ENDPOINTS.journalVouchers.list,
      payload,
    );
  },
  remove(id: number) {
    return apiClient.delete<{ message: string }>(
      API_ENDPOINTS.journalVouchers.byId(id),
    );
  },
};

export const fundTransferService = {
  list(params: { page: number; pageSize: number }) {
    return apiClient.get<ListResponse<FundTransfer>>(
      API_ENDPOINTS.fundTransfers.list,
      { query: params },
    );
  },
  create(payload: CreateFundTransferPayload) {
    return apiClient.post<{ data: FundTransfer }>(
      API_ENDPOINTS.fundTransfers.list,
      payload,
    );
  },
  remove(id: number) {
    return apiClient.delete<{ message: string }>(
      API_ENDPOINTS.fundTransfers.byId(id),
    );
  },
};
