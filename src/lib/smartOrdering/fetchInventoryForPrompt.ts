/**
 * Server-only: loads inventory from Capstone Express for AI prompt grounding.
 * Uses the same Bearer token the browser uses for /api/inventory/list.
 */

const DEFAULT_PAGE_SIZE = 500;

export type InventoryForPromptResult =
  | { ok: true; text: string }
  | { ok: false; status: number; message: string };

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
}

/**
 * @param authorizationHeader Full header value, e.g. "Bearer eyJ..."
 */
export async function fetchInventoryForPrompt(
  authorizationHeader: string,
): Promise<InventoryForPromptResult> {
  const trimmed = authorizationHeader.trim();
  if (!trimmed.toLowerCase().startsWith("bearer ")) {
    return { ok: false, status: 401, message: "Missing or invalid Authorization header." };
  }

  const url = `${apiBase()}/api/inventory/list?Page=1&PageSize=${DEFAULT_PAGE_SIZE}`;
  const res = await fetch(url, {
    headers: {
      Authorization: trimmed,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const rawText = await res.text();
  let body: unknown;
  try {
    body = rawText ? JSON.parse(rawText) : null;
  } catch {
    return {
      ok: false,
      status: 502,
      message: "Inventory API returned invalid JSON.",
    };
  }

  if (res.status === 401) {
    return {
      ok: false,
      status: 401,
      message: "Session expired or not authorized to load inventory.",
    };
  }

  if (!res.ok) {
    const msg =
      typeof body === "object" &&
      body !== null &&
      "Message" in body &&
      typeof (body as { Message?: unknown }).Message === "string"
        ? (body as { Message: string }).Message
        : `Inventory request failed (${res.status}).`;
    return {
      ok: false,
      status: res.status >= 400 && res.status < 600 ? res.status : 502,
      message: msg,
    };
  }

  if (!body || typeof body !== "object") {
    return { ok: false, status: 502, message: "Unexpected inventory response shape." };
  }

  const o = body as Record<string, unknown>;
  if (o.Success === false) {
    return {
      ok: false,
      status: 502,
      message: String(o.Message ?? "Inventory list reported failure."),
    };
  }

  const data = o.Data;
  if (!Array.isArray(data)) {
    return { ok: false, status: 502, message: "Inventory list missing Data array." };
  }

  const items = data.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.Id,
      sku: r.Sku ?? "",
      item_name: r.ProductName ?? "",
      category: r.Category ?? "",
      current_stock: r.Quantity ?? 0,
      location: r.Location ?? "",
      status: r.Status,
      unit_price: r.UnitPrice,
    };
  });

  const envelope = {
    source: "Capstone WMS GET /api/inventory/list (live database)",
    page: o.Page ?? 1,
    pageSize: o.PageSize ?? items.length,
    totalCount: o.Total ?? items.length,
    items,
  };

  const text =
    "### 1) Inventory List (from live database)\n\n" +
    JSON.stringify(envelope, null, 2) +
    "\n";

  return { ok: true, text };
}
