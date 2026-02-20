export enum OrderStatusEnum {
  Processing = "0",
  Pending = "1",
}

export type OrderItemDTO = {
  Id: string;
  OrderId?: string | null;
  InventoryItemId?: string | null;
  Quantity?: number | string | null;
  UnitPrice?: number | string | null;
};

export type OrderDTO = {
  Id: string;
  OrderType?: string | null;
  OrderDate?: string | Date | null;
  OrderStatus?: OrderStatusEnum | string | number | null;
  OrderCompletedDate?: string | Date | null;
  CustomerName?: string | null;
  CustomerEmail?: string | null;
  Customer?: {
    Name?: string | null;
    Email?: string | null;
  } | null;
  OrderItems?: OrderItemDTO[] | null;
};

export type UpsertOrderItemDTO = {
  Id?: string;
  OrderId?: string;
  InventoryItemId: string;
  Quantity?: number;
};

export type UpsertOrderDTO = {
  Id?: string;
  OrderType?: string;
  OrderDate?: string | Date;
  OrderStatus: OrderStatusEnum | string;
  OrderCompletedDate?: string | Date;
  OrderItems?: UpsertOrderItemDTO[];
};

export type OrderListQuery = {
  Page?: number;
  PageSize?: number;

  Id?: string;
  OrderType?: string;
  OrderDate?: string;
  OrderStatus?: number | string;
  OrderCompletedDate?: string;

  OrderColumn?: "Id" | "OrderType" | "OrderDate" | "OrderStatus" | "OrderCompletedDate";
  OrderDirection?: "asc" | "ASC" | "desc" | "DESC";
};

export type OrderItemListQuery = {
  Page?: number;
  PageSize?: number;

  Id?: string;
  OrderId?: string;
  InventoryItemId?: string;
  Quantity?: number;
  UnitPrice?: number;

  OrderColumn?: "Id" | "OrderId" | "InventoryItemId" | "Quantity" | "UnitPrice";
  OrderDirection?: "asc" | "ASC" | "desc" | "DESC";
};
