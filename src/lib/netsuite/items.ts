import { netsuiteRequest, isMockMode } from "./client";
import { mockSearchItems, mockSearchItemsWithFilters, mockGetItem } from "./mock";
import type { NetSuiteItemResult } from "./types";
import { getFiltersForTable } from "@/lib/services/adminConfig";
import type { TableFilters } from "@/lib/schemas/adminConfig";

// RESTlet script/deploy IDs — set these to match your NetSuite deployment
const ITEM_SEARCH_SCRIPT = process.env.NS_ITEM_SEARCH_SCRIPT || "customscript_box_item_search";
const ITEM_SEARCH_DEPLOY = process.env.NS_ITEM_SEARCH_DEPLOY || "customdeploy_box_item_search";

export interface ItemSearchResult {
  items: NetSuiteItemResult[];
  total: number;
  hasMore: boolean;
}

/**
 * Search NetSuite items by keyword (part number, name, manufacturer).
 */
export async function searchItems(
  query: string,
  limit: number = 25,
  offset: number = 0
): Promise<ItemSearchResult> {
  if (isMockMode()) {
    return mockSearchItems(query, limit, offset);
  }

  return netsuiteRequest<ItemSearchResult>({
    scriptId: ITEM_SEARCH_SCRIPT,
    deployId: ITEM_SEARCH_DEPLOY,
    method: "GET",
    params: { q: query, limit, offset },
    timeoutMs: 30000,
  });
}

/**
 * Search NetSuite items with table-specific filters applied.
 */
export async function searchItemsWithFilters(
  query: string,
  tableKey: string,
  limit: number = 25,
  offset: number = 0
): Promise<ItemSearchResult> {
  // Get filters for this table from admin config
  const filters = await getFiltersForTable(tableKey);

  if (isMockMode()) {
    return mockSearchItemsWithFilters(query, filters, limit, offset);
  }

  // For real NetSuite, we'd pass filters as params
  // For now, apply client-side filtering after fetch
  const result = await netsuiteRequest<ItemSearchResult>({
    scriptId: ITEM_SEARCH_SCRIPT,
    deployId: ITEM_SEARCH_DEPLOY,
    method: "GET",
    params: { q: query, limit: limit * 2, offset }, // Fetch more to account for filtering
    timeoutMs: 30000,
  });

  // Apply filters client-side
  const filtered = applyFilters(result.items, filters);

  return {
    items: filtered.slice(0, limit),
    total: filtered.length,
    hasMore: filtered.length > limit,
  };
}

/**
 * Apply table filters to a list of items.
 */
function applyFilters(
  items: NetSuiteItemResult[],
  filters: TableFilters
): NetSuiteItemResult[] {
  return items.filter((item) => {
    // Item type filter (cast to string[] for comparison)
    if (filters.itemTypes?.length) {
      const allowedTypes = filters.itemTypes as string[];
      if (!allowedTypes.includes(item.itemType)) {
        return false;
      }
    }

    // Name contains filter (OR logic - match any)
    if (filters.nameContains?.length) {
      const nameMatch = filters.nameContains.some(
        (pattern) =>
          item.displayName.toLowerCase().includes(pattern.toLowerCase()) ||
          item.itemId.toLowerCase().includes(pattern.toLowerCase()) ||
          item.description?.toLowerCase().includes(pattern.toLowerCase())
      );
      if (!nameMatch) return false;
    }

    // Name excludes filter (AND logic - exclude all)
    if (filters.nameExcludes?.length) {
      const excluded = filters.nameExcludes.some(
        (pattern) =>
          item.displayName.toLowerCase().includes(pattern.toLowerCase()) ||
          item.itemId.toLowerCase().includes(pattern.toLowerCase())
      );
      if (excluded) return false;
    }

    // Manufacturer filter
    if (filters.manufacturers?.length) {
      if (!filters.manufacturers.includes(item.manufacturer)) {
        return false;
      }
    }

    // Cost range filter
    if (filters.costMin != null && item.cost < filters.costMin) {
      return false;
    }
    if (filters.costMax != null && item.cost > filters.costMax) {
      return false;
    }

    return true;
  });
}

/**
 * Get a single item by its internal ID or item ID (part number).
 */
export async function getItem(
  itemId: string
): Promise<NetSuiteItemResult | null> {
  if (isMockMode()) {
    return mockGetItem(itemId);
  }

  try {
    return await netsuiteRequest<NetSuiteItemResult>({
      scriptId: ITEM_SEARCH_SCRIPT,
      deployId: ITEM_SEARCH_DEPLOY,
      method: "GET",
      params: { id: itemId },
      timeoutMs: 15000,
    });
  } catch (error) {
    const err = error as Error & { status?: number };
    if (err.status === 404) return null;
    throw error;
  }
}
