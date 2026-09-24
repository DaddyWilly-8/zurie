import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

// Shape of Enquiry\Resources\EnquiryResource on the backend.
export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
};

const normalizeEnquiry = (
  row: Partial<Enquiry> & { id?: unknown },
): Enquiry => ({
  id: String(row.id ?? ""),
  name: String(row.name ?? ""),
  email: String(row.email ?? ""),
  phone: row.phone ?? null,
  subject: row.subject ?? null,
  message: String(row.message ?? ""),
  status: String(row.status ?? "new"),
  createdAt: String(row.createdAt ?? ""),
});

export const enquiryService = {
  listEnquiries(params: {
    page: number;
    pageSize: number;
    search?: string;
    status?: string;
  }) {
    return apiClient
      .get<{
        data?: Partial<Enquiry>[];
        count?: number;
        page?: number;
        pageSize?: number;
        meta?: { count?: number; page?: number; pageSize?: number };
      }>(API_ENDPOINTS.enquiries.adminList, { query: params })
      .then((response) => ({
        data: (response.data ?? []).map(normalizeEnquiry),
        count: response.meta?.count ?? response.count ?? 0,
        page: response.meta?.page ?? response.page ?? params.page,
        pageSize:
          response.meta?.pageSize ?? response.pageSize ?? params.pageSize,
      }));
  },

  /** POST /contact — `email` or `phone` (at least one) must be given. */
  createEnquiry(payload: {
    name: string;
    email?: string;
    phone?: string;
    subject?: string;
    message: string;
  }) {
    return apiClient.post<{ success: boolean }>(API_ENDPOINTS.contact, payload);
  },

  updateEnquiryStatus(id: string, status: string) {
    return apiClient.patch<{ success: boolean }>(
      API_ENDPOINTS.enquiries.adminById(id),
      { status },
    );
  },
};
