import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export type PriceListItem = {
  productId: number;
  price: number;
  salePrice: number | null;
};

export type PriceList = {
  id: number;
  name: string;
  isDefault: boolean;
  outletId: number | null;
  customerId: number | null;
  validFrom: string | null;
  validTo: string | null;
  isActive: boolean;
  items: PriceListItem[];
};

export type CreatePriceListPayload = {
  name: string;
  outletId?: number | null;
  customerId?: number | null;
  validFrom?: string | null;
  validTo?: string | null;
};

export const priceListService = {
  list() {
    return apiClient
      .get<{ data: PriceList[] }>(API_ENDPOINTS.priceLists.list)
      .then((response) => response.data);
  },

  create(payload: CreatePriceListPayload) {
    return apiClient.post<{ data: PriceList }>(
      API_ENDPOINTS.priceLists.list,
      payload,
    );
  },

  update(
    id: number,
    payload: Partial<CreatePriceListPayload & { isActive: boolean }>,
  ) {
    return apiClient.patch<{ data: PriceList }>(
      API_ENDPOINTS.priceLists.byId(id),
      payload,
    );
  },

  setActive(id: number, isActive: boolean) {
    return apiClient.patch<{ data: PriceList }>(
      API_ENDPOINTS.priceLists.byId(id),
      { isActive },
    );
  },

  setItem(
    id: number,
    productId: number,
    price: number,
    salePrice?: number | null,
  ) {
    return apiClient.post<{ data: PriceList }>(
      API_ENDPOINTS.priceLists.items(id),
      {
        productId,
        price,
        salePrice: salePrice ?? undefined,
      },
    );
  },

  removeItem(id: number, productId: number) {
    return apiClient.delete<{ data: PriceList }>(
      API_ENDPOINTS.priceLists.itemByProduct(id, productId),
    );
  },
};
