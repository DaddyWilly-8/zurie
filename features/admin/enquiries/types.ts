export type AdminEnquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
};

export type EnquiryListResult = {
  data: AdminEnquiryRow[];
  count: number;
};
