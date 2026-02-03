import { http } from "../http";
import type { PagedApiResponse } from "../types";
import type { InventoryItemDTO, InventoryListQuery } from "./inventory.types";
import { mapInventoryItem, type InventoryItem } from "./inventory.mapper";

function toQueryString(params: InventoryListQuery): string {
  const usp = new URLSearchParams();

  (Object.entries(params) as Array<[keyof InventoryListQuery, unknown]>).forEach(
    ([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      usp.set(String(k), String(v));
    }
  );

  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export const inventoryApi = {
  async list(query: InventoryListQuery = {}) {
    const raw = (await http.raw<InventoryItemDTO[]>(
      `/api/inventory/list${toQueryString(query)}`
    )) as PagedApiResponse<InventoryItemDTO>;

    return {
      items: raw.Data.map(mapInventoryItem),
      total: raw.Total,
      page: raw.Page,
      pageSize: raw.PageSize,
      success: raw.Success,
      message: raw.Message,
    };
  },

  async getById(id: string): Promise<InventoryItem> {
    const dto = await http.data<InventoryItemDTO>(`/api/inventory/${id}`);
    return mapInventoryItem(dto);
  },

  async create(payload: Omit<InventoryItemDTO, "Id">): Promise<string> {
    return http.data<string>(`/api/inventory`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: InventoryItemDTO): Promise<string> {
    return http.data<string>(`/api/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async remove(id: string): Promise<string> {
    return http.data<string>(`/api/inventory/${id}`, { method: "DELETE" });
  },
};
