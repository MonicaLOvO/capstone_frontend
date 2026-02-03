"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Input,
  Option,
  Select,
  Sheet,
  Table,
  Typography,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Stack,
} from "@mui/joy";

import { inventoryApi } from "@/app/api/inventory/inventory.api";
import {
  InventoryItemStatusEnum,
  type InventoryListQuery,
  type InventoryItemDTO,
} from "@/app/api/inventory/inventory.types";
import { type InventoryItem } from "@/app/api/inventory/inventory.mapper";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import { InventoryRowMenu } from "@/components/inventory/InventoryRowMenu";
import { InventoryItemDialog } from "@/components/inventory/InventoryItemDialog";

function statusChip(status: string) {
  switch (status) {
    case InventoryItemStatusEnum.InStock:
      return { label: "In stock", color: "success" as const, variant: "soft" as const };
    case InventoryItemStatusEnum.LowStock:
      return { label: "Low stock", color: "warning" as const, variant: "soft" as const };
    case InventoryItemStatusEnum.OutStock:
    default:
      return { label: "Out of stock", color: "neutral" as const, variant: "soft" as const };
  }
}

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function InventoryPage() {
  // Filters
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  // Paging
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Data
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selected, setSelected] = useState<InventoryItem | null>(null);

  // delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // QR lookup modal (simple: type/paste QR value)
  const [qrOpen, setQrOpen] = useState(false);
  const [qrValue, setQrValue] = useState("");

  const categoryOptions = useMemo(
    () => ["", "Electronics", "Furniture", "Safety", "Supplies", "Tools"],
    []
  );

  const statusOptions = useMemo(
    () => [
      { value: "", label: "All" },
      { value: InventoryItemStatusEnum.InStock, label: "In stock" },
      { value: InventoryItemStatusEnum.LowStock, label: "Low stock" },
      { value: InventoryItemStatusEnum.OutStock, label: "Out of stock" },
    ],
    []
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function refresh() {
    const term = debouncedSearch.trim();

    const baseQuery: InventoryListQuery = {
      Page: page,
      PageSize: pageSize,
      Category: category || undefined,
      Status: status ? Number(status) : undefined,
      OrderColumn: "ProductName",
      OrderDirection: "asc",
    };

    // backend filters are exact: search both fields and merge
    if (!term) {
      const res = await inventoryApi.list(baseQuery);
      setItems(res.items);
      setTotal(res.total);
      return;
    }

    const [byName, bySku] = await Promise.all([
      inventoryApi.list({ ...baseQuery, ProductName: term }),
      inventoryApi.list({ ...baseQuery, Sku: term }),
    ]);

    const map = new Map<string, InventoryItem>();
    [...byName.items, ...bySku.items].forEach((x) => map.set(x.id, x));

    setItems(Array.from(map.values()));
    setTotal(Math.max(byName.total, bySku.total));
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        await refresh();
      } catch (err: unknown) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, category, status, page]);

  async function handleCreate(payload: Omit<InventoryItemDTO, "Id">) {
    setSubmitting(true);
    try {
      await inventoryApi.create(payload);
      // reload first page so new item is visible
      setPage(1);
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(payload: Omit<InventoryItemDTO, "Id">) {
    if (!selected) return;
    setSubmitting(true);
    try {
      // backend expects Id in payload in your sample PUT body,
      // so we include it for safety:
      await inventoryApi.update(selected.id, {
        Id: selected.id,
        ...payload,
      });
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteConfirmed() {
    if (!selected) return;
    setDeleteSubmitting(true);
    try {
      await inventoryApi.remove(selected.id);
      setDeleteOpen(false);
      await refresh();
    } finally {
      setDeleteSubmitting(false);
    }
  }

  async function handleQrLookup() {
    const q = qrValue.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    try {
      // simplest lookup: filter list by QrCodeValue if your backend supports it.
      // If backend DOES NOT support QrCodeValue filter, we will do client-side filter after list().
      const res = await inventoryApi.list({
        Page: 1,
        PageSize: 50,
        OrderColumn: "ProductName",
        OrderDirection: "asc",
      });

      const found = res.items.find((x) => x.qrCodeValue === q);
      if (!found) {
        setError("No item found for that QR code value.");
      } else {
        setSelected(found);
        setEditOpen(true); // open details/edit
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "QR lookup failed");
    } finally {
      setLoading(false);
      setQrOpen(false);
      setQrValue("");
    }
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography level="h1" sx={{ fontSize: "2.5rem", fontWeight: 700 }}>
            Inventory Management
          </Typography>
          <Typography level="body-sm" sx={{ color: "text.tertiary", mt: 0.5 }}>
            Search, filter, and manage warehouse items.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" color="neutral" onClick={() => setQrOpen(true)}>
            QR Lookup
          </Button>
          <Button color="primary" onClick={() => setCreateOpen(true)}>
            + Add Product
          </Button>
        </Stack>
      </Box>

      {/* Filters */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr 1fr" },
          gap: 2,
          mb: 3,
          alignItems: "end",
        }}
      >
        <Box>
          <Typography level="body-sm" sx={{ mb: 1 }}>
            Search for item
          </Typography>
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by SKU or Product"
            startDecorator="🔎"
          />
        </Box>

        <Box>
          <Typography level="body-sm" sx={{ mb: 1 }}>
            Status
          </Typography>
          <Select
            value={status}
            onChange={(_, v) => {
              setStatus(v ?? "");
              setPage(1);
            }}
            placeholder="All"
            aria-label="Status filter"
          >
            {statusOptions.map((s) => (
              <Option key={s.value || "ALL"} value={s.value}>
                {s.label}
              </Option>
            ))}
          </Select>
        </Box>

        <Box>
          <Typography level="body-sm" sx={{ mb: 1 }}>
            Category
          </Typography>
          <Select
            value={category}
            onChange={(_, v) => {
              setCategory(v ?? "");
              setPage(1);
            }}
            placeholder="All"
            aria-label="Category filter"
          >
            {categoryOptions.map((c) => (
              <Option key={c || "ALL"} value={c}>
                {c || "All"}
              </Option>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Table */}
      <Sheet variant="outlined" sx={{ borderRadius: "lg", overflow: "hidden", width: "100%" }}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
            {loading ? "Loading…" : `Showing ${items.length} item(s)`}
            {total ? ` • Total: ${total}` : ""}
            {error ? ` • ${error}` : ""}
          </Typography>

          <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
            Page {page} / {totalPages}
          </Typography>
        </Box>

        <Box sx={{ overflowX: "auto" }}>
          <Table
            stickyHeader
            hoverRow
            sx={{
              minWidth: 980,
              "& thead th": { fontWeight: 700 },
              "& tbody td": { verticalAlign: "middle" },
            }}
          >
            <thead>
              <tr>
                <th style={{ width: 260 }}>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th style={{ width: 110 }}>Quantity</th>
                <th style={{ width: 240 }}>Location</th>
                <th style={{ width: 120 }}>Price</th>
                <th style={{ width: 140 }}>Status</th>
                <th style={{ width: 70, textAlign: "right" }} />
              </tr>
            </thead>

            <tbody>
              {!loading && items.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <Box sx={{ py: 6, textAlign: "center" }}>
                      <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                        No results.
                      </Typography>
                    </Box>
                  </td>
                </tr>
              ) : (
                items.map((it) => {
                  const chip = statusChip(it.status);
                  return (
                    <tr key={it.id}>
                      <td>
                        <Typography level="body-sm" fontWeight={600}>
                          {it.productName || "—"}
                        </Typography>
                      </td>
                      <td>{it.sku || "—"}</td>
                      <td>{it.category || "—"}</td>
                      <td>{it.quantity}</td>
                      <td>{it.location || "—"}</td>
                      <td>{money(it.unitPrice)}</td>
                      <td>
                        <Chip color={chip.color} variant={chip.variant} size="sm">
                          {chip.label}
                        </Chip>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <InventoryRowMenu
                          onEdit={() => {
                            setSelected(it);
                            setEditOpen(true);
                          }}
                          onQr={() => {
                            // show QR data (or you can open edit and highlight)
                            setQrValue(it.qrCodeValue || "");
                            setQrOpen(true);
                          }}
                          onDelete={() => {
                            setSelected(it);
                            setDeleteOpen(true);
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Box>

        {/* Pagination */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>

          <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
            Page {page} of {totalPages}
          </Typography>

          <Button
            variant="outlined"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </Box>
      </Sheet>

      {/* Create Dialog */}
      <InventoryItemDialog
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        submitting={submitting}
      />

      {/* Edit Dialog */}
      <InventoryItemDialog
        open={editOpen}
        mode="edit"
        initial={
          selected
            ? ({
                Id: selected.id,
                ProductName: selected.productName,
                Sku: selected.sku,
                Category: selected.category,
                Quantity: selected.quantity,
                UnitPrice: selected.unitPrice,
                Location: selected.location,
                QrCodeValue: selected.qrCodeValue,
                Description: selected.description,
                ImageUrl: selected.imageUrl,
                Status: selected.status,
              } satisfies Partial<InventoryItemDTO>)
            : null
        }
        onClose={() => setEditOpen(false)}
        onSubmit={handleEdit}
        submitting={submitting}
      />

      {/* Delete confirm */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <ModalDialog variant="outlined" role="alertdialog" sx={{ borderRadius: "lg", width: 420 }}>
          <DialogTitle>Delete item?</DialogTitle>
          <DialogContent>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              This action cannot be undone. The item will be removed from inventory.
            </Typography>

            <Typography sx={{ mt: 1 }} fontWeight={600}>
              {selected?.productName || "Item"}
            </Typography>

            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 2 }}>
              <Button variant="outlined" color="neutral" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button color="danger" loading={deleteSubmitting} onClick={handleDeleteConfirmed}>
                Delete
              </Button>
            </Stack>
          </DialogContent>
        </ModalDialog>
      </Modal>

      {/* QR Lookup modal (paste QR value for now) */}
      <Modal open={qrOpen} onClose={() => setQrOpen(false)}>
        <ModalDialog variant="outlined" sx={{ borderRadius: "lg", width: 520 }}>
          <DialogTitle>QR Code Lookup</DialogTitle>
          <DialogContent>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              Paste or scan a QR code value to find an item quickly.
            </Typography>

            <Input
              sx={{ mt: 2 }}
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
              placeholder="QR-INV-001-..."
              autoFocus
            />

            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 2 }}>
              <Button variant="outlined" color="neutral" onClick={() => setQrOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleQrLookup}>Find Item</Button>
            </Stack>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
