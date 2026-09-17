import { cashierSessionService } from "@/services/cashier-sessions/cashier-session.service";

export const cashierSessionActions = {
  list(page: number, pageSize: number) {
    return cashierSessionService.list({ page, pageSize });
  },

  current(outletId: number) {
    return cashierSessionService.current(outletId);
  },

  open(outletId: number, openingBalance: number) {
    return cashierSessionService.open(outletId, openingBalance);
  },

  close(id: number, closingBalance: number) {
    return cashierSessionService.close(id, closingBalance);
  },
};
