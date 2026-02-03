"use client";

import React, { useEffect, useMemo, useState } from "react";
import {Box,Button,Chip,Input,Option,Select,Sheet,Table,Typography,} from "@mui/joy";

import { inventoryApi } from "@/app/api/inventory/inventory.api";
import {InventoryItemStatusEnum,type InventoryListQuery,} from "@/app/api/inventory/inventory.types";
import { type InventoryItem } from "@/app/api/inventory/inventory.mapper";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

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

  const [category, setCategory] = useState<string>(""); // "" => all
  const [status, setStatus] = useState<string>(""); // "" => all

  // Paging
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Data
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const term = debouncedSearch.trim();

        const baseQuery: InventoryListQuery = {
          Page: page,
          PageSize: pageSize,
          Category: category || undefined,
          Status: status ? Number(status) : undefined,
          OrderColumn: "ProductName",
          OrderDirection: "asc",
        };

        if (!term) {
          const res = await inventoryApi.list(baseQuery);
          if (cancelled) return;
          setItems(res.items);
          setTotal(res.total);
          return;
        }

        const [byName, bySku] = await Promise.all([
          inventoryApi.list({ ...baseQuery, ProductName: term }),
          inventoryApi.list({ ...baseQuery, Sku: term }),
        ]);

        if (cancelled) return;

        const map = new Map<string, InventoryItem>();
        [...byName.items, ...bySku.items].forEach((x) => map.set(x.id, x));
        setItems(Array.from(map.values()));
        setTotal(Math.max(byName.total, bySku.total));
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
  }, [debouncedSearch, category, status, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header row (like Orders) */}
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

        <Button
          color="primary"
          onClick={() => alert("Open Add Product modal")}
          sx={{ borderRadius: "lg" }}
        >
          + Add Product
        </Button>
      </Box>

      {/* Filters row */}
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

          {/* Accessible name */}
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

          {/* Accessible name */}
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

      {/* Table Card */}
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "lg",
          overflow: "hidden",
          width: "100%",
        }}
      >
        {/* Top bar */}
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
              minWidth: 900,
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
                <th style={{ width: 90, textAlign: "right" }}>Action</th>
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
                        <Button
                          size="sm"
                          variant="soft"
                          onClick={() => alert(`Edit ${it.id}`)}
                          aria-label={`Edit ${it.productName || "item"}`}
                        >
                          ✎
                        </Button>
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
    </Box>
  );
}
