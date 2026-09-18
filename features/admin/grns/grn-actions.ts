import { grnService } from "@/services/procurement/grn.service";

export const grnActions = {
  list(page: number, pageSize: number) {
    return grnService.list({ page, pageSize });
  },
};
