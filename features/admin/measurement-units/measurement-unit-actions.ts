import { measurementUnitService } from "@/services/measurement-units/measurement-unit.service";
import type { MeasurementUnitForm } from "./types";

export const measurementUnitActions = {
  list() {
    return measurementUnitService.list();
  },

  create(form: MeasurementUnitForm) {
    return measurementUnitService.create({
      name: form.name,
      symbol: form.symbol,
      description: form.description || undefined,
    });
  },

  update(id: number, form: MeasurementUnitForm) {
    return measurementUnitService.update(id, {
      name: form.name,
      symbol: form.symbol,
      description: form.description || undefined,
    });
  },

  setActive(id: number, isActive: boolean) {
    return measurementUnitService.setActive(id, isActive);
  },
};
