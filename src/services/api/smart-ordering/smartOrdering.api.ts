import { http } from "@/services/api/http";
import type { SmartOrderingRow } from "./smartOrdering.types";

/**
 * Mock dataset — matches PM reference layout; replace when API returns real rows.
 * Set NEXT_PUBLIC_SMART_ORDERING_MOCK=false and implement live path once backend is ready.
 */
const MOCK_RECOMMENDATIONS: SmartOrderingRow[] = [
  {
    id: "1",
    name: "Premium Arabica Coffee Beans",
    sku: "CF-2048-A",
    category: "Beverages",
    currentStock: 82,
    maxCapacity: 300,
    recommendedQty: 150,
    recommendationNote: "Suggested reorder based on forecasted depletion",
    reasoning:
      "Velocity increasing by 40% due to seasonal demand spike across retail channels.",
    stockoutRisk: "high",
    confidencePercent: 94,
    confidenceLabel: "seasonality match",
  },
  {
    id: "2",
    name: "Eco Dish Soap Refill",
    sku: "HS-1182-E",
    category: "Household",
    currentStock: 140,
    maxCapacity: 260,
    recommendedQty: 90,
    recommendationNote: "Suggested reorder based on forecasted depletion",
    reasoning:
      "Vendor delay predicted based on historical lead-time variance and current purchase cadence.",
    stockoutRisk: "medium",
    confidencePercent: 88,
    confidenceLabel: "trend-based",
  },
  {
    id: "3",
    name: "Industrial Nitrile Gloves (M)",
    sku: "SG-9921-M",
    category: "Safety",
    currentStock: 210,
    maxCapacity: 400,
    recommendedQty: 40,
    recommendationNote: "Suggested reorder based on forecasted depletion",
    reasoning:
      "Stable usage with slight upward trend from new workstation onboarding next month.",
    stockoutRisk: "low",
    confidencePercent: 76,
    confidenceLabel: "baseline forecast",
  },
  {
    id: "4",
    name: "12V Cordless Drill Kit",
    sku: "TL-4400-D",
    category: "Tools",
    currentStock: 18,
    maxCapacity: 120,
    recommendedQty: 60,
    recommendationNote: "Suggested reorder based on forecasted depletion",
    reasoning:
      "Promotional bundle driving attach rate; stock projected below safety level in 12 days.",
    stockoutRisk: "high",
    confidencePercent: 91,
    confidenceLabel: "promo uplift",
  },
];

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Fetches AI reorder rows. Independent of Reports page — no merge required.
 *
 * Live integration (when ready):
 * - Add backend route (e.g. GET /api/smart-ordering/recommendations or team’s chosen path).
 * - Map response to SmartOrderingRow[] (handle PascalCase if needed).
 * - Set NEXT_PUBLIC_SMART_ORDERING_MOCK=false in .env.local
 */
export async function getSmartOrderingRecommendations(): Promise<SmartOrderingRow[]> {
  const useMock =
    typeof process.env.NEXT_PUBLIC_SMART_ORDERING_MOCK === "undefined" ||
    process.env.NEXT_PUBLIC_SMART_ORDERING_MOCK !== "false";

  if (useMock) {
    await delay(350);
    return MOCK_RECOMMENDATIONS;
  }

  try {
    const res = await http.raw<SmartOrderingRow[]>(
      "/api/smart-ordering/recommendations",
    );
    if (res.Success && Array.isArray(res.Data)) {
      return res.Data;
    }
    throw new Error(res.Message || "Failed to load recommendations");
  } catch (e) {
    console.warn(
      "[smart-ordering] Live API failed; ensure endpoint exists or set NEXT_PUBLIC_SMART_ORDERING_MOCK=true",
      e,
    );
    throw e;
  }
}

/** For tests or Storybook */
export function getMockSmartOrderingRecommendations(): SmartOrderingRow[] {
  return [...MOCK_RECOMMENDATIONS];
}
