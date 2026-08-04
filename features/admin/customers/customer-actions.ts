import { customerService } from "@/services/customers/customer.service";
import type { AdminCustomerDetail, AdminCustomerRow } from "./types";

export const customerActions = {
  async list(): Promise<AdminCustomerRow[]> {
    return (await customerService.listCustomers()) as AdminCustomerRow[];
  },

  async detail(id: string): Promise<AdminCustomerDetail | null> {
    return (await customerService.getCustomerById(id)) as AdminCustomerDetail | null;
  },
};
