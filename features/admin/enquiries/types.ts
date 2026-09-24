import type { Enquiry } from "@/services/enquiries/enquiry.service";

export type AdminEnquiryRow = Enquiry;

export type EnquiryListResult = {
  data: AdminEnquiryRow[];
  count: number;
};
