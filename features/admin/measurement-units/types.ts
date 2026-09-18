export type { MeasurementUnit } from "@/services/measurement-units/measurement-unit.service";

export type MeasurementUnitForm = {
  name: string;
  symbol: string;
  description: string;
};

export const emptyMeasurementUnitForm: MeasurementUnitForm = {
  name: "",
  symbol: "",
  description: "",
};
