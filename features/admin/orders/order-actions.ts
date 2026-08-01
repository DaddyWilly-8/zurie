import { orderService } from "@/services/orders/order.service";
import type { AdminOrderRow, OrderListResult } from "./types";

const pageSize = 10;

export const orderActions = {
  pageSize,

  async list(page: number, search: string, status: string): Promise<OrderListResult> {
    const payload = await orderService.listOrders({
      page,
      pageSize,
      search: search.trim() || undefined,
      status: status || undefined,
    });

    return {
      data: (payload.data ?? []) as AdminOrderRow[],
      count: payload.count ?? 0,
    };
  },

  updateStatus(id: string, nextStatus: string) {
    return orderService.updateOrderStatus(id, nextStatus);
  },
};
