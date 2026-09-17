export type { CostCenter } from "@/services/cost-centers/cost-center.service";

export type CostCenterForm = {
  name: string;
  parentId: number | "";
};

export const emptyCostCenterForm: CostCenterForm = {
  name: "",
  parentId: "",
};
