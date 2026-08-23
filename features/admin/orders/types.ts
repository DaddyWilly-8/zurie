export type AdminOrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  whatsapp_number: string;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
};

export type OrderListResult = {
  data: AdminOrderRow[];
  count: number;
};
