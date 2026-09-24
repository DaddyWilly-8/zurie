export type PosCartLine = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  vatExempted?: boolean;
};

export type CustomerMode = "walkin" | "existing";
