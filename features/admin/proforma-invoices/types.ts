export type {
  ProformaInvoice,
  ProformaInvoiceItem,
} from "@/services/proforma-invoices/proforma-invoice.service";

export type ProformaInvoiceLineForm = {
  productId: number | "";
  quantity: string;
  unitPrice: string;
};

export type ProformaInvoiceForm = {
  salesOutletId: number | "";
  stakeholderId: number | "";
  currencyId: number | "";
  proformaDate: string;
  expiryDate: string;
  notes: string;
  items: ProformaInvoiceLineForm[];
};

export const emptyProformaInvoiceLine: ProformaInvoiceLineForm = {
  productId: "",
  quantity: "1",
  unitPrice: "",
};

export const emptyProformaInvoiceForm: ProformaInvoiceForm = {
  salesOutletId: "",
  stakeholderId: "",
  currencyId: "",
  proformaDate: "",
  expiryDate: "",
  notes: "",
  items: [{ ...emptyProformaInvoiceLine }],
};
