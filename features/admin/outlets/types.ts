export type { SalesOutlet } from "@/services/outlets/outlet.service";

export type OutletForm = {
  name: string;
  type: "physical" | "online";
  address: string;
  costCenterId: number | "";
};

export const emptyOutletForm: OutletForm = {
  name: "",
  type: "physical",
  address: "",
  costCenterId: "",
};
