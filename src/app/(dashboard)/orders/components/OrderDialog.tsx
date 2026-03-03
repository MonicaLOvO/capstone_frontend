"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalDialog,
  Option,
  Select,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";
import { OrderStatusEnum, type UpsertOrderDTO } from "@/services/api/orders/orders.types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { searchInventory } from "@/services/api/inventory/inventory.search";
import { InventoryItemStatusEnum } from "@/services/api/inventory/inventory.types";
import type { InventoryItem } from "@/services/api/inventory/inventory.mapper";

type OrderFormValues = {
  OrderType: string;
  OrderDate: string;
  OrderStatus: string;
  OrderCompletedDate: string;
};

type AddedOrderItem = {
  inventoryItemId: string;
  productName: string;
  sku: string;
  quantityAvailable: number;
  quantity: number;
};

function toDateInput(value?: string | Date) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function toFormValues(initial?: Partial<UpsertOrderDTO> | null): OrderFormValues {
  return {
    OrderType: String(initial?.OrderType ?? ""),
    OrderDate: toDateInput(initial?.OrderDate) || todayInput(),
    OrderStatus: String(initial?.OrderStatus ?? OrderStatusEnum.Pending),
    OrderCompletedDate: toDateInput(initial?.OrderCompletedDate),
  };
}

function isNonEmpty(s: string) {
  return s.trim().length > 0;
}

export function OrderDialog({
  open,
  onClose,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: UpsertOrderDTO) => Promise<void>;
  submitting: boolean;
}) {
  const [values, setValues] = useState<OrderFormValues>(() => toFormValues());
  const [inventorySearch, setInventorySearch] = useState("");
  const debouncedInventorySearch = useDebouncedValue(inventorySearch, 350);
  const [inventoryResults, setInventoryResults] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<AddedOrderItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(toFormValues());
      setInventorySearch("");
      setInventoryResults([]);
      setInventoryLoading(false);
      setInventoryError(null);
      setAddedItems([]);
      setErrors({});
      setApiError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function runSearch() {
      try {
        setInventoryLoading(true);
        setInventoryError(null);

        const response = await searchInventory({
          term: debouncedInventorySearch.trim(),
          Page: 1,
          PageSize: 8,
          OrderColumn: "ProductName",
          OrderDirection: "asc",
        });

        if (cancelled) return;
        setInventoryResults(response.items);
      } catch (err: unknown) {
        if (cancelled) return;
        setInventoryResults([]);
        setInventoryError(err instanceof Error ? err.message : "Failed to search inventory");
      } finally {
        if (!cancelled) setInventoryLoading(false);
      }
    }

    runSearch();
    return () => {
      cancelled = true;
    };
  }, [debouncedInventorySearch, open]);

  const setField = (key: keyof OrderFormValues, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  function canAddItem(item: InventoryItem) {
    return (
      item.status === InventoryItemStatusEnum.InStock &&
      item.quantity > 0 &&
      !addedItems.some((x) => x.inventoryItemId === item.id)
    );
  }

  function addItem(item: InventoryItem) {
    if (!canAddItem(item)) return;

    setAddedItems((prev) => [
      ...prev,
      {
        inventoryItemId: item.id,
        productName: item.productName || "Unnamed Item",
        sku: item.sku || "-",
        quantityAvailable: item.quantity,
        quantity: 1,
      },
    ]);
    setErrors((prev) => ({ ...prev, OrderItems: "" }));
  }

  function removeItem(inventoryItemId: string) {
    setAddedItems((prev) => prev.filter((x) => x.inventoryItemId !== inventoryItemId));
  }

  function validate(v: OrderFormValues) {
    const next: Record<string, string> = {};
    if (!isNonEmpty(v.OrderType)) next.OrderType = "Order type is required";
    if (!isNonEmpty(v.OrderDate)) next.OrderDate = "Order date is required";
    if (!isNonEmpty(v.OrderStatus)) next.OrderStatus = "Status is required";
    if (addedItems.length === 0) next.OrderItems = "Add at least one in-stock inventory item";
    return next;
  }

  async function handleSubmit() {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setApiError(null);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: UpsertOrderDTO = {
      OrderType: values.OrderType.trim(),
      OrderDate: values.OrderDate,
      OrderStatus: values.OrderStatus,
      OrderCompletedDate: values.OrderCompletedDate || undefined,
      OrderItems: addedItems.map((item) => ({
        InventoryItemId: item.inventoryItemId,
        Quantity: item.quantity,
      })),
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        size="lg"
        sx={{
          width: { xs: "95vw", sm: 760 },
          borderRadius: "lg",
        }}
      >
        <DialogTitle>
          <Stack spacing={0.5}>
            <Typography level="h3">Add New Order</Typography>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              Enter the details of the order to save it.
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {apiError ? (
              <Typography level="body-sm" color="danger">
                {apiError}
              </Typography>
            ) : null}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl error={Boolean(errors.OrderType)} sx={{ flex: 1 }}>
                <FormLabel>Order Type</FormLabel>
                <Input
                  value={values.OrderType}
                  onChange={(e) => setField("OrderType", e.target.value)}
                  placeholder="Sales, Restock..."
                />
                {errors.OrderType ? <FormHelperText>{errors.OrderType}</FormHelperText> : null}
              </FormControl>

              <FormControl error={Boolean(errors.OrderStatus)} sx={{ flex: 1 }}>
                <FormLabel>Status</FormLabel>
                <Select
                  value={values.OrderStatus}
                  onChange={(_, v) => setField("OrderStatus", v ?? "")}
                  placeholder="Select status"
                  aria-label="Order status"
                >
                  <Option value={OrderStatusEnum.Pending}>Pending</Option>
                  <Option value={OrderStatusEnum.Processing}>Processing</Option>
                </Select>
                {errors.OrderStatus ? <FormHelperText>{errors.OrderStatus}</FormHelperText> : null}
              </FormControl>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl error={Boolean(errors.OrderDate)} sx={{ flex: 1 }}>
                <FormLabel>Order Date</FormLabel>
                <Input
                  type="date"
                  value={values.OrderDate}
                  onChange={(e) => setField("OrderDate", e.target.value)}
                />
                {errors.OrderDate ? <FormHelperText>{errors.OrderDate}</FormHelperText> : null}
              </FormControl>

              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Completed Date</FormLabel>
                <Input
                  type="date"
                  value={values.OrderCompletedDate}
                  onChange={(e) => setField("OrderCompletedDate", e.target.value)}
                />
              </FormControl>
            </Stack>

            <Stack spacing={1}>
              <Typography level="title-sm">Search Inventory Item</Typography>
              <Input
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search by product name or SKU"
              />

              <Sheet variant="soft" sx={{ borderRadius: "sm", p: 1, maxHeight: 220, overflowY: "auto" }}>
                {inventoryLoading ? (
                  <Typography level="body-sm">Searching inventory...</Typography>
                ) : inventoryError ? (
                  <Typography level="body-sm" color="danger">
                    {inventoryError}
                  </Typography>
                ) : inventoryResults.length === 0 ? (
                  <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                    No inventory items found.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {inventoryResults.map((item) => {
                      const inStock =
                        item.status === InventoryItemStatusEnum.InStock && item.quantity > 0;
                      const alreadyAdded = addedItems.some((x) => x.inventoryItemId === item.id);
                      return (
                        <Stack
                          key={item.id}
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          justifyContent="space-between"
                          alignItems={{ xs: "stretch", sm: "center" }}
                          sx={{ p: 1, borderRadius: "sm", bgcolor: "background.surface" }}
                        >
                          <Box>
                            <Typography level="body-sm" fontWeight={600}>
                              {item.productName || "Unnamed Item"}
                            </Typography>
                            <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                              SKU: {item.sku || "-"} | Qty: {item.quantity}
                            </Typography>
                            {!inStock ? (
                              <Typography level="body-xs" color="warning">
                                Not in stock
                              </Typography>
                            ) : null}
                          </Box>
                          <Button
                            size="sm"
                            variant="outlined"
                            disabled={!inStock || alreadyAdded}
                            onClick={() => addItem(item)}
                          >
                            {alreadyAdded ? "Added" : "Add Item"}
                          </Button>
                        </Stack>
                      );
                    })}
                  </Stack>
                )}
              </Sheet>
            </Stack>

            <Stack spacing={1}>
              <Typography level="title-sm">Items Added to Order</Typography>
              {addedItems.length === 0 ? (
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  No items added yet.
                </Typography>
              ) : (
                <Sheet variant="soft" sx={{ borderRadius: "sm", p: 1 }}>
                  <Stack spacing={1}>
                    {addedItems.map((item) => (
                      <Stack
                        key={item.inventoryItemId}
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "stretch", sm: "center" }}
                        spacing={1}
                        sx={{ p: 1, borderRadius: "sm", bgcolor: "background.surface" }}
                      >
                        <Box>
                          <Typography level="body-sm" fontWeight={600}>
                            {item.productName}
                          </Typography>
                          <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                            SKU: {item.sku} | Quantity: {item.quantity} | In stock:{" "}
                            {item.quantityAvailable}
                          </Typography>
                        </Box>
                        <Button
                          size="sm"
                          variant="outlined"
                          color="danger"
                          onClick={() => removeItem(item.inventoryItemId)}
                        >
                          Remove
                        </Button>
                      </Stack>
                    ))}
                  </Stack>
                </Sheet>
              )}
              {errors.OrderItems ? (
                <Typography level="body-sm" color="danger">
                  {errors.OrderItems}
                </Typography>
              ) : null}
            </Stack>

            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ pt: 1 }}>
              <Button variant="outlined" color="neutral" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={submitting}>
                Add Order
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
}
