import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export type Stakeholder = {
  id: number;
  userId: number | null;
  name: string;
  phone: string | null;
  type: string | null;
  tin: string | null;
  vrn: string | null;
  address: string | null;
  email: string | null;
  website: string | null;
  remarks: string | null;
  whatsappNumber: string | null;
  isActive: boolean;
  createdAt: string;
};

export type StakeholderListResponse = {
  success: boolean;
  data: Stakeholder[];
  meta: { count: number; page: number; pageSize: number };
};

export const stakeholderService = {
  /**
   * A merged cross-role view (see backend StakeholderController's
   * docblock) — used as the picker for Purchase Orders/Proforma
   * Invoices, which reference "a stakeholder" generically rather than
   * specifically a customer or a supplier. Only the first page (20) is
   * fetched — fine for a picker, same "edge case not handled yet"
   * caveat as the existing Suppliers picker elsewhere in this codebase.
   */
  list() {
    return apiClient
      .get<StakeholderListResponse>(API_ENDPOINTS.stakeholders.list)
      .then((response) => response.data);
  },
};
