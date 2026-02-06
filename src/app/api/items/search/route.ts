import { NextRequest, NextResponse } from "next/server";
import { searchItems, searchItemsWithFilters } from "@/lib/netsuite/items";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  const tableKey = searchParams.get("tableKey");
  const limit = Math.min(parseInt(searchParams.get("limit") || "25", 10), 100);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: "Search query must be at least 2 characters" },
      { status: 400 }
    );
  }

  try {
    // Use filtered search if tableKey is provided
    const result = tableKey
      ? await searchItemsWithFilters(q, tableKey, limit, offset)
      : await searchItems(q, limit, offset);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Item search error:", error);
    return NextResponse.json(
      { error: "Failed to search items" },
      { status: 500 }
    );
  }
}
