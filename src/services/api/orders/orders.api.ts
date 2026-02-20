import { http } from "../http";
import type { PagedApiResponse } from "../types";
import {
  mapOrder,
  mapOrderItem,
  type Order,
  type OrderItem,
} from "./orders.mapper";
import type {
  OrderDTO,
  OrderItemDTO,
  OrderItemListQuery,
  OrderListQuery,
  UpsertOrderDTO,
  UpsertOrderItemDTO,
} from "./orders.types";

function toQueryString(params: Record<string, unknown>): string {
  const usp = new URLSearchParams();

  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    usp.set(k, String(v));
  });

  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export const ordersApi = {
  async list(query: OrderListQuery = {}) {
    const raw = (await http.raw<OrderDTO[]>(
      `/api/order/list${toQueryString(query)}`
    )) as PagedApiResponse<OrderDTO>;

    return {
      items: raw.Data.map(mapOrder),
      total: raw.Total,
      page: raw.Page,
      pageSize: raw.PageSize,
      success: raw.Success,
      message: raw.Message,
    };
  },

  async getById(id: string): Promise<Order> {
    const dto = await http.data<OrderDTO>(`/api/order/${id}`);
    return mapOrder(dto);
  },

  async create(payload: UpsertOrderDTO): Promise<string> {
    return http.data<string>(`/api/order`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: UpsertOrderDTO): Promise<string> {
    return http.data<string>(`/api/order/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async remove(id: string): Promise<string> {
    return http.data<string>(`/api/order/${id}`, { method: "DELETE" });
  },

  async listItems(orderId: string, query: OrderItemListQuery = {}) {
    const raw = (await http.raw<OrderItemDTO[]>(
      `/api/orderItem/list/${orderId}${toQueryString(query)}`
    )) as PagedApiResponse<OrderItemDTO>;

    return {
      items: raw.Data.map(mapOrderItem),
      total: raw.Total,
      page: raw.Page,
      pageSize: raw.PageSize,
      success: raw.Success,
      message: raw.Message,
    };
  },

  async getItemById(id: string): Promise<OrderItem> {
    const dto = await http.data<OrderItemDTO>(`/api/orderItem/${id}`);
    return mapOrderItem(dto);
  },

  async createItem(payload: UpsertOrderItemDTO): Promise<string> {
    return http.data<string>(`/api/orderItem`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateItem(id: string, payload: UpsertOrderItemDTO): Promise<string> {
    return http.data<string>(`/api/orderItem/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async removeItem(id: string): Promise<string> {
    return http.data<string>(`/api/orderItem/${id}`, { method: "DELETE" });
  },
};
