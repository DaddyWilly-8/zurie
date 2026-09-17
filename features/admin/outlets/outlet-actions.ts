import { outletService } from "@/services/outlets/outlet.service";
import type { OutletForm } from "./types";

export const outletActions = {
  list() {
    return outletService.list();
  },

  create(form: OutletForm) {
    return outletService.create({
      name: form.name,
      type: form.type,
      address: form.address || undefined,
      costCenterId: form.costCenterId === "" ? null : form.costCenterId,
    });
  },

  update(id: number, form: OutletForm) {
    return outletService.update(id, {
      name: form.name,
      type: form.type,
      address: form.address || undefined,
      costCenterId: form.costCenterId === "" ? null : form.costCenterId,
    });
  },

  setActive(id: number, isActive: boolean) {
    return outletService.setActive(id, isActive);
  },
};
