import type { OrderDTO, OrderItemDTO } from "./orders.types";

export type OrderItem = {
  id: string;
  orderId: string;
  inventoryItemId: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  orderType: string;
  orderDate: string;
  orderStatus: string;
  orderCompletedDate: string;
  customerName: string;
  customerEmail: string;
  orderItems: OrderItem[];
};

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toStringDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  return typeof value === "string" ? value : value.toISOString();
}

export function mapOrderItem(dto: OrderItemDTO): OrderItem {
  return {
    id: dto.Id,
    orderId: dto.OrderId ?? "",
    inventoryItemId: dto.InventoryItemId ?? "",
    quantity: toNumber(dto.Quantity),
    unitPrice: toNumber(dto.UnitPrice),
  };
}

export function mapOrder(dto: OrderDTO): Order {
  return {
    id: dto.Id,
    orderType: dto.OrderType ?? "",
    orderDate: toStringDate(dto.OrderDate),
    orderStatus:
      dto.OrderStatus === null || dto.OrderStatus === undefined
        ? ""
        : String(dto.OrderStatus),
    orderCompletedDate: toStringDate(dto.OrderCompletedDate),
    customerName: dto.Customer?.Name ?? dto.CustomerName ?? "",
    customerEmail: dto.Customer?.Email ?? dto.CustomerEmail ?? "",
    orderItems: (dto.OrderItems ?? []).map(mapOrderItem),
  };
}
