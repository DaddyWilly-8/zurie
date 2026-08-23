// features/admin/orders/order-actions.ts
import { orderService } from "@/services/orders/order.service";
import type { AdminOrderRow, OrderListResult } from "./types";

const pageSize = 10;

export const orderActions = {
  pageSize,

  async list(
    page: number,
    search: string,
    status: string,
  ): Promise<OrderListResult> {
    const payload = await orderService.listOrders({
      page,
      pageSize,
      search: search.trim() || undefined,
      status: status || undefined,
    });

    // Transform OrderListItem to AdminOrderRow
    const data: AdminOrderRow[] = (payload.data ?? []).map((item) => ({
      id: String(item.id),
      order_number: item.orderNumber,
      status: item.status,
      customer_name: item.customerName,
      total_amount: item.totalAmount,
      created_at: item.createdAt,
      // Add default values for fields that don't exist in list view
      customer_phone: item.customer_phone,
      whatsapp_number: item.whatsapp_number,
      notes: null,
      items: [],
    }));

    return {
      data,
      count: payload.meta?.count ?? 0,
    };
  },

  updateStatus(orderNumber: string, nextStatus: string) {
    return orderService.updateOrderStatus(orderNumber, nextStatus);
  },
};
