/**
 * Server-only: loads inventory + order line history from Express for Smart ordering AI.
 * Order fetch failures are non-fatal (inventory-only prompt).
 */

const INVENTORY_PAGE_SIZE = 500;
const ORDER_LIST_PAGE_SIZE = 100;
const MAX_ORDERS_FOR_LINE_FETCH = 40;
const ORDER_ITEMS_PAGE_SIZE = 200;
const ORDER_FETCH_CONCURRENCY = 8;

export type InventoryMergeRow = {
  id: string;
  sku: string;
  productName: string;
  category: string;
  quantity: number;
  location: string;
  imageUrl: string | null;
  status: string;
};

export type SmartOrderingLiveContext =
  | { ok: false; status: number; message: string }
  | {
      ok: true;
      promptText: string;
      mergeBySkuKey: Map<string, InventoryMergeRow>;
      hasOrdersSection: boolean;
    };

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
}

function normalizeSku(s: string): string {
  return s.trim().toLowerCase();
}

type ApiEnvelope = {
  Success?: boolean;
  Message?: string | null;
  Data?: unknown;
  Total?: number;
  Page?: number;
  PageSize?: number;
};

async function backendGet(
  authorizationHeader: string,
  pathWithQuery: string,
): Promise<{ ok: true; body: unknown } | { ok: false; status: number; message: string }> {
  const res = await fetch(`${apiBase()}${pathWithQuery}`, {
    headers: {
      Authorization: authorizationHeader.trim(),
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const rawText = await res.text();
  let body: unknown;
  try {
    body = rawText ? JSON.parse(rawText) : null;
  } catch {
    return { ok: false, status: 502, message: "Backend returned invalid JSON." };
  }

  if (res.status === 401) {
    return {
      ok: false,
      status: 401,
      message: "Session expired or not authorized.",
    };
  }

  if (!res.ok) {
    const o = body as ApiEnvelope;
    const msg =
      typeof o?.Message === "string" && o.Message
        ? o.Message
        : `Request failed (${res.status}).`;
    return {
      ok: false,
      status: res.status >= 400 && res.status < 600 ? res.status : 502,
      message: msg,
    };
  }

  return { ok: true, body };
}

function inventoryFromEnvelope(body: unknown): {
  promptText: string;
  mergeBySkuKey: Map<string, InventoryMergeRow>;
} | null {
  if (!body || typeof body !== "object") return null;
  const o = body as ApiEnvelope;
  if (o.Success === false) return null;
  const data = o.Data;
  if (!Array.isArray(data)) return null;

  const mergeBySkuKey = new Map<string, InventoryMergeRow>();

  const items = data.map((row) => {
    const r = row as Record<string, unknown>;
    const sku = String(r.Sku ?? "");
    const id = String(r.Id ?? "");
    const productName = String(r.ProductName ?? "");
    const imageRaw = r.ImageUrl;
    const imageUrl =
      imageRaw === null || imageRaw === undefined
        ? null
        : String(imageRaw).trim() || null;

    const merge: InventoryMergeRow = {
      id,
      sku,
      productName,
      category: String(r.Category ?? ""),
      quantity: Number(r.Quantity ?? 0),
      location: String(r.Location ?? ""),
      imageUrl,
      status:
        r.Status === null || r.Status === undefined ? "" : String(r.Status),
    };

    const key = normalizeSku(sku);
    if (key) {
      mergeBySkuKey.set(key, merge);
    }

    return {
      id,
      sku,
      item_name: productName,
      category: merge.category,
      current_stock: merge.quantity,
      location: merge.location,
      status: merge.status,
      unit_price: r.UnitPrice,
      image_url: imageUrl,
    };
  });

  const envelope = {
    source: "Capstone WMS GET /api/inventory/list (live database)",
    page: o.Page ?? 1,
    pageSize: o.PageSize ?? items.length,
    totalCount: o.Total ?? items.length,
    items,
  };

  const promptText =
    "### 1) Inventory List (from live database)\n\n" +
    JSON.stringify(envelope, null, 2) +
    "\n";

  return { promptText, mergeBySkuKey };
}

type OrderHeader = { id: string; orderDate: string; orderType: string; orderStatus: string };

function parseOrderList(body: unknown): OrderHeader[] {
  if (!body || typeof body !== "object") return [];
  const o = body as ApiEnvelope;
  if (o.Success === false || !Array.isArray(o.Data)) return [];
  return o.Data.map((row) => {
    const r = row as Record<string, unknown>;
    const od = r.OrderDate;
    const dateStr =
      od === null || od === undefined
        ? ""
        : typeof od === "string"
          ? od
          : od instanceof Date
            ? od.toISOString()
            : String(od);
    return {
      id: String(r.Id ?? ""),
      orderDate: dateStr,
      orderType: String(r.OrderType ?? ""),
      orderStatus:
        r.OrderStatus === null || r.OrderStatus === undefined
          ? ""
          : String(r.OrderStatus),
    };
  }).filter((x) => x.id);
}

function parseOrderItems(body: unknown): Array<{
  inventoryItemId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}> {
  if (!body || typeof body !== "object") return [];
  const o = body as ApiEnvelope;
  if (o.Success === false || !Array.isArray(o.Data)) return [];
  return o.Data.map((row) => {
    const r = row as Record<string, unknown>;
    const q = r.Quantity;
    const qty =
      typeof q === "number"
        ? q
        : typeof q === "string"
          ? Number(q)
          : Number(q ?? 0);
    const up = r.UnitPrice;
    const price =
      typeof up === "number"
        ? up
        : typeof up === "string"
          ? Number(up)
          : Number(up ?? 0);
    return {
      inventoryItemId: String(r.InventoryItemId ?? ""),
      productName: String(r.ProductName ?? ""),
      quantity: Number.isFinite(qty) ? qty : 0,
      unitPrice: Number.isFinite(price) ? price : 0,
    };
  });
}

async function fetchOrderItemsForOrder(
  authorizationHeader: string,
  orderId: string,
): Promise<
  Array<{
    inventoryItemId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>
> {
  const path = `/api/orderItem/list/${orderId}?Page=1&PageSize=${ORDER_ITEMS_PAGE_SIZE}`;
  const res = await backendGet(authorizationHeader, path);
  if (!res.ok) return [];
  return parseOrderItems(res.body);
}

async function buildOrdersPromptSection(
  authorizationHeader: string,
  mergeByInventoryId: Map<string, InventoryMergeRow>,
): Promise<{ text: string; hasData: boolean }> {
  const listPath = `/api/order/list?Page=1&PageSize=${ORDER_LIST_PAGE_SIZE}`;
  const listRes = await backendGet(authorizationHeader, listPath);
  if (!listRes.ok) {
    return {
      text:
        "\n### 2) Historical orders (live database)\n\n_Order list could not be loaded; use inventory only for demand signals._\n",
      hasData: false,
    };
  }

  const orders = parseOrderList(listRes.body);
  const slice = orders.slice(0, MAX_ORDERS_FOR_LINE_FETCH);

  const lines: Array<{
    order_id: string;
    order_date: string;
    order_type: string;
    order_status: string;
    inventory_item_id: string;
    sku: string;
    product_name: string;
    qty_ordered: number;
  }> = [];

  for (let i = 0; i < slice.length; i += ORDER_FETCH_CONCURRENCY) {
    const batch = slice.slice(i, i + ORDER_FETCH_CONCURRENCY);
    const nested = await Promise.all(
      batch.map(async (ord) => {
        const items = await fetchOrderItemsForOrder(authorizationHeader, ord.id);
        return items.map((it) => {
          const invRow = mergeByInventoryId.get(it.inventoryItemId);
          const nameFromInv = invRow?.productName ?? "";
          return {
            order_id: ord.id,
            order_date: ord.orderDate,
            order_type: ord.orderType,
            order_status: ord.orderStatus,
            inventory_item_id: it.inventoryItemId,
            sku: invRow?.sku ?? "",
            product_name: it.productName || nameFromInv,
            qty_ordered: it.quantity,
          };
        });
      }),
    );
    for (const n of nested) {
      lines.push(...n);
    }
  }

  const byInv = new Map<
    string,
    { totalQty: number; lineCount: number; lastOrderDate: string }
  >();
  for (const ln of lines) {
    if (!ln.inventory_item_id) continue;
    const cur = byInv.get(ln.inventory_item_id) ?? {
      totalQty: 0,
      lineCount: 0,
      lastOrderDate: "",
    };
    cur.totalQty += ln.qty_ordered;
    cur.lineCount += 1;
    if (ln.order_date && ln.order_date > cur.lastOrderDate) {
      cur.lastOrderDate = ln.order_date;
    }
    byInv.set(ln.inventory_item_id, cur);
  }

  const skuDemandSummary = Array.from(byInv.entries())
    .map(([inventoryItemId, agg]) => {
      const inv = mergeByInventoryId.get(inventoryItemId);
      return {
        inventory_item_id: inventoryItemId,
        sku: inv?.sku ?? "",
        item_name: inv?.productName ?? "",
        lines_in_sample: agg.lineCount,
        total_qty_ordered_in_sample: agg.totalQty,
        last_order_date_in_sample: agg.lastOrderDate,
      };
    })
    .filter((x) => x.sku || x.item_name);

  const envelope = {
    source:
      "Capstone WMS GET /api/order/list + GET /api/orderItem/list/{orderId} (live database)",
    orders_scanned_for_lines: slice.length,
    order_lines_in_prompt: lines.length,
    sku_demand_summary: skuDemandSummary.slice(0, 200),
    recent_order_lines_sample: lines.slice(0, 120),
  };

  const hasData = lines.length > 0;

  const text =
    "\n### 2) Historical orders (from live database)\n\n" +
    JSON.stringify(envelope, null, 2) +
    "\n";

  return { text, hasData };
}

/**
 * Loads inventory (required) and enriches with order history (best-effort).
 */
export async function loadSmartOrderingContext(
  authorizationHeader: string,
): Promise<SmartOrderingLiveContext> {
  const trimmed = authorizationHeader.trim();
  if (!trimmed.toLowerCase().startsWith("bearer ")) {
    return { ok: false, status: 401, message: "Missing or invalid Authorization header." };
  }

  const invPath = `/api/inventory/list?Page=1&PageSize=${INVENTORY_PAGE_SIZE}`;
  const invRes = await backendGet(trimmed, invPath);
  if (!invRes.ok) {
    return { ok: false, status: invRes.status, message: invRes.message };
  }

  const parsed = inventoryFromEnvelope(invRes.body);
  if (!parsed) {
    const o = invRes.body as ApiEnvelope;
    return {
      ok: false,
      status: 502,
      message: String(o?.Message ?? "Inventory list missing or invalid Data array."),
    };
  }

  const mergeByInventoryId = new Map<string, InventoryMergeRow>();
  for (const row of parsed.mergeBySkuKey.values()) {
    if (row.id) {
      mergeByInventoryId.set(row.id, row);
    }
  }

  const ordersBlock = await buildOrdersPromptSection(trimmed, mergeByInventoryId);

  const promptText = parsed.promptText + ordersBlock.text;

  return {
    ok: true,
    promptText,
    mergeBySkuKey: parsed.mergeBySkuKey,
    hasOrdersSection: ordersBlock.hasData,
  };
}
