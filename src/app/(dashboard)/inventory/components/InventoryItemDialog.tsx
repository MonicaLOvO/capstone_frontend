"use client";

import React, { useMemo, useState } from "react";
import {
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
  Stack,
  Typography,
} from "@mui/joy";
import type { InventoryItemDTO } from "@/services/api/inventory/inventory.types";
import { InventoryItemStatusEnum } from "@/services/api/inventory/inventory.types";

type Mode = "create" | "edit";

export type InventoryItemFormValues = {
  ProductName: string;
  Sku: string;
  Category: string;
  Quantity: string; // keep as string for input
  UnitPrice: string;
  Location: string;
  QrCodeValue: string;
  Description: string;
  ImageUrl: string;
  Status: string; // enum string "0" | "2" | "5"
};

function toFormValues(dto?: Partial<InventoryItemDTO> | null): InventoryItemFormValues {
  return {
    ProductName: String(dto?.ProductName ?? ""),
    Sku: String(dto?.Sku ?? ""),
    Category: String(dto?.Category ?? ""),
    Quantity: dto?.Quantity === null || dto?.Quantity === undefined ? "" : String(dto?.Quantity),
    UnitPrice:
      dto?.UnitPrice === null || dto?.UnitPrice === undefined ? "" : String(dto?.UnitPrice),
    Location: String(dto?.Location ?? ""),
    QrCodeValue: String(dto?.QrCodeValue ?? ""),
    Description: String(dto?.Description ?? ""),
    ImageUrl: String(dto?.ImageUrl ?? ""),
    Status: dto?.Status === null || dto?.Status === undefined ? InventoryItemStatusEnum.OutStock : String(dto.Status),
  };
}

function isNonEmpty(s: string) {
  return s.trim().length > 0;
}

function isNonNegativeNumberString(s: string) {
  if (!isNonEmpty(s)) return false;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0;
}

export function InventoryItemDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  submitting,
}: {
  open: boolean;
  mode: Mode;
  initial?: Partial<InventoryItemDTO> | null;
  onClose: () => void;
  onSubmit: (payload: Omit<InventoryItemDTO, "Id">) => Promise<void>;
  submitting: boolean;
}) {
  const [values, setValues] = useState<InventoryItemFormValues>(() => toFormValues(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // reset form when opening or initial changes
  React.useEffect(() => {
    if (open) {
      setValues(toFormValues(initial));
      setErrors({});
      setApiError(null);
    }
  }, [open, initial]);

  const title = mode === "create" ? "Add New Product" : "Edit Product";

  const statusOptions = useMemo(
    () => [
      { value: InventoryItemStatusEnum.InStock, label: "In stock" },
      { value: InventoryItemStatusEnum.LowStock, label: "Low stock" },
      { value: InventoryItemStatusEnum.OutStock, label: "Out of stock" },
    ],
    []
  );

  function validate(v: InventoryItemFormValues) {
    const next: Record<string, string> = {};

    // Minimal required fields for your system
    if (!isNonEmpty(v.ProductName)) next.ProductName = "Product name is required";
    if (!isNonEmpty(v.Sku)) next.Sku = "SKU is required";
    if (!isNonEmpty(v.Category)) next.Category = "Category is required";
    if (!isNonEmpty(v.Location)) next.Location = "Location is required";

    if (!isNonEmpty(v.Quantity)) next.Quantity = "Quantity is required";
    else if (!isNonNegativeNumberString(v.Quantity)) next.Quantity = "Quantity must be 0 or higher";

    if (!isNonEmpty(v.UnitPrice)) next.UnitPrice = "Unit price is required";
    else if (!isNonNegativeNumberString(v.UnitPrice)) next.UnitPrice = "Unit price must be 0 or higher";

    if (!isNonEmpty(v.Status)) next.Status = "Status is required";

    return next;
  }

  async function handleSubmit() {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setApiError(null);

    if (Object.keys(nextErrors).length > 0) return;

    const payload: Omit<InventoryItemDTO, "Id"> = {
      ProductName: values.ProductName.trim(),
      Sku: values.Sku.trim(),
      Category: values.Category.trim(),
      Location: values.Location.trim(),
      Description: values.Description.trim() || null,
      ImageUrl: values.ImageUrl.trim() || null,
      QrCodeValue: values.QrCodeValue.trim() || null,
      Quantity: Number(values.Quantity),
      UnitPrice: Number(values.UnitPrice),
      Status: Number(values.Status), // ✅ convert to number for backend
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  const setField = (key: keyof InventoryItemFormValues, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

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
            <Typography level="h3">{title}</Typography>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              Enter the details of the product to save it to inventory.
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

            {/* Two-column grid */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl error={Boolean(errors.ProductName)} sx={{ flex: 1 }}>
                <FormLabel>Product Name</FormLabel>
                <Input
                  value={values.ProductName}
                  onChange={(e) => setField("ProductName", e.target.value)}
                  placeholder="Enter product name"
                />
                {errors.ProductName ? <FormHelperText>{errors.ProductName}</FormHelperText> : null}
              </FormControl>

              <FormControl error={Boolean(errors.Sku)} sx={{ flex: 1 }}>
                <FormLabel>SKU</FormLabel>
                <Input
                  value={values.Sku}
                  onChange={(e) => setField("Sku", e.target.value)}
                  placeholder="PROX-XXX-0001"
                />
                {errors.Sku ? <FormHelperText>{errors.Sku}</FormHelperText> : null}
              </FormControl>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl error={Boolean(errors.Category)} sx={{ flex: 1 }}>
                <FormLabel>Category</FormLabel>
                <Input
                  value={values.Category}
                  onChange={(e) => setField("Category", e.target.value)}
                  placeholder="Electronics, Furniture..."
                />
                {errors.Category ? <FormHelperText>{errors.Category}</FormHelperText> : null}
              </FormControl>

              <FormControl sx={{ flex: 1 }}>
                <FormLabel>QR Code Value</FormLabel>
                <Input
                  value={values.QrCodeValue}
                  onChange={(e) => setField("QrCodeValue", e.target.value)}
                  placeholder="QR-INV-001..."
                />
              </FormControl>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl error={Boolean(errors.Quantity)} sx={{ flex: 1 }}>
                <FormLabel>Quantity</FormLabel>
                <Input
                  type="number"
                  value={values.Quantity}
                  onChange={(e) => setField("Quantity", e.target.value)}
                  placeholder="0"
                />
                {errors.Quantity ? <FormHelperText>{errors.Quantity}</FormHelperText> : null}
              </FormControl>

              <FormControl error={Boolean(errors.UnitPrice)} sx={{ flex: 1 }}>
                <FormLabel>Unit Price ($)</FormLabel>
                <Input
                  type="number"
                  value={values.UnitPrice}
                  onChange={(e) => setField("UnitPrice", e.target.value)}
                  placeholder="0.00"
                />
                {errors.UnitPrice ? <FormHelperText>{errors.UnitPrice}</FormHelperText> : null}
              </FormControl>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl error={Boolean(errors.Location)} sx={{ flex: 1 }}>
                <FormLabel>Location</FormLabel>
                <Input
                  value={values.Location}
                  onChange={(e) => setField("Location", e.target.value)}
                  placeholder="Warehouse A - Shelf B3"
                />
                {errors.Location ? <FormHelperText>{errors.Location}</FormHelperText> : null}
              </FormControl>

              <FormControl error={Boolean(errors.Status)} sx={{ flex: 1 }}>
                <FormLabel>Status</FormLabel>
                <Select
                  value={values.Status}
                  onChange={(_, v) => setField("Status", v ?? "")}
                  placeholder="Select status"
                  aria-label="Item status"
                >
                  {statusOptions.map((s) => (
                    <Option key={s.value} value={s.value}>
                    {s.label}
                    </Option>
                  ))}
                </Select>
                {errors.Status ? <FormHelperText>{errors.Status}</FormHelperText> : null}
              </FormControl>
            </Stack>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input
                value={values.Description}
                onChange={(e) => setField("Description", e.target.value)}
                placeholder="Optional"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Image URL</FormLabel>
              <Input
                value={values.ImageUrl}
                onChange={(e) => setField("ImageUrl", e.target.value)}
                placeholder="https://..."
              />
            </FormControl>

            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ pt: 1 }}>
              <Button variant="outlined" color="neutral" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={submitting}>
                {mode === "create" ? "Add Product" : "Save Changes"}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
}
