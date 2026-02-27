import { inventoryApi } from "./inventory.api";

function dedupeById<T extends { id: string }>(arr: T[]): T[] {
  const map = new Map<string, T>();
  for (const x of arr) map.set(x.id, x);
  return Array.from(map.values());
}

// Since backend filters look exact, this gives a better UX:
export async function searchInventory(params: {
  term: string;
  Page?: number;
  PageSize?: number;
  Category?: string;
  Status?: number;
  OrderColumn?: "ProductName" | "Sku";
  OrderDirection?: "asc" | "desc" | "ASC" | "DESC";
}) {
  const { term, Page = 1, PageSize = 10, Category, Status, OrderColumn, OrderDirection } = params;

  // if no search term, just list
  if (!term.trim()) {
    return inventoryApi.list({
      Page,
      PageSize,
      Category,
      Status,
      OrderColumn: OrderColumn ?? "ProductName",
      OrderDirection: OrderDirection ?? "asc",
    });
  }

  // Search ProductName and SKU in parallel, then merge
  const [byName, bySku] = await Promise.all([
    inventoryApi.list({
      Page,
      PageSize,
      ProductName: term,
      Category,
      Status,
      OrderColumn: "ProductName",
      OrderDirection: "asc",
    }),
    inventoryApi.list({
      Page,
      PageSize,
      Sku: term,
      Category,
      Status,
      OrderColumn: "Sku",
      OrderDirection: "asc",
    }),
  ]);

  const merged = dedupeById([...byName.items, ...bySku.items]);

  // NOTE: pagination becomes “best effort” when merging two queries.
  // For a perfect solution, backend should support a single `q` search.
  return {
    items: merged,
    total: Math.max(byName.total, bySku.total), // best effort
    page: Page,
    pageSize: PageSize,
    success: true,
    message: null,
  };
}
