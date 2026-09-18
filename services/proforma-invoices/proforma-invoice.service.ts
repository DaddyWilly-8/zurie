import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export type ProformaInvoiceItem = {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type ProformaInvoice = {
  id: number;
  proformaNumber: string;
  proformaDate: string;
  expiryDate: string | null;
  salesOutletId: number;
  stakeholderId: number;
  currencyId: number;
  exchangeRate: number;
  totalAmount: number;
  isActive: boolean;
  notes: string | null;
  items: ProformaInvoiceItem[];
  createdAt: string;
};

export type ProformaInvoiceListResponse = {
  success: boolean;
  data: ProformaInvoice[];
  meta: { count: number; page: number; pageSize: number };
};

export type ProformaInvoicePayload = {
  proformaDate?: string;
  expiryDate?: string | null;
  salesOutletId: number;
  stakeholderId: number;
  currencyId?: number;
  notes?: string;
  items: Array<{ productId: number; quantity: number; unitPrice: number }>;
};

export const proformaInvoiceService = {
  list(params: { page: number; pageSize: number }) {
    return apiClient.get<ProformaInvoiceListResponse>(
      API_ENDPOINTS.proformaInvoices.list,
      { query: params },
    );
  },

  create(payload: ProformaInvoicePayload) {
    return apiClient.post<{ data: ProformaInvoice }>(
      API_ENDPOINTS.proformaInvoices.list,
      payload,
    );
  },

  update(id: number, payload: Partial<ProformaInvoicePayload>) {
    return apiClient.patch<{ data: ProformaInvoice }>(
      API_ENDPOINTS.proformaInvoices.byId(id),
      payload,
    );
  },

  setActive(id: number, isActive: boolean) {
    return apiClient.patch<{ data: ProformaInvoice }>(
      API_ENDPOINTS.proformaInvoices.active(id),
      { isActive },
    );
  },
};
