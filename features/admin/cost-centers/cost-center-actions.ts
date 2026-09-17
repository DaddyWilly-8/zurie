import { costCenterService } from "@/services/cost-centers/cost-center.service";
import type { CostCenterForm } from "./types";

export const costCenterActions = {
  list() {
    return costCenterService.list();
  },

  create(form: CostCenterForm) {
    return costCenterService.create({
      name: form.name,
      parentId: form.parentId === "" ? null : form.parentId,
    });
  },

  update(id: number, form: CostCenterForm) {
    return costCenterService.update(id, {
      name: form.name,
      parentId: form.parentId === "" ? null : form.parentId,
    });
  },

  setActive(id: number, isActive: boolean) {
    return costCenterService.setActive(id, isActive);
  },
};
