import { enquiryService } from "@/services/enquiries/enquiry.service";
import type { AdminEnquiryRow, EnquiryListResult } from "./types";

const PAGE_SIZE = 10;

export const enquiryActions = {
  pageSize: PAGE_SIZE,

  async list(page: number, search: string, status: string): Promise<EnquiryListResult> {
    const payload = await enquiryService.listEnquiries({
      page,
      pageSize: PAGE_SIZE,
      search: search.trim() || undefined,
      status: status || undefined,
    });

    return {
      data: (payload.data ?? []) as AdminEnquiryRow[],
      count: payload.count ?? 0,
    };
  },

  async updateStatus(id: string, status: string) {
    return enquiryService.updateEnquiryStatus(id, status);
  },
};
