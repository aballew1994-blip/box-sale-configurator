import { NextRequest, NextResponse } from "next/server";
import { updateTableFilterConfigSchema } from "@/lib/schemas/adminConfig";
import {
  getTableFilterConfig,
  updateTableFilterConfig,
} from "@/lib/services/adminConfig";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tableKey: string }> }
) {
  const { tableKey } = await params;
  try {
    const config = await getTableFilterConfig(tableKey);
    if (!config) {
      return NextResponse.json(
        { error: "Table filter config not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ config });
  } catch (error) {
    console.error("Get table filter config error:", error);
    return NextResponse.json(
      { error: "Failed to get table filter config" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tableKey: string }> }
) {
  const { tableKey } = await params;
  try {
    const body = await request.json();
    const parsed = updateTableFilterConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const config = await updateTableFilterConfig(tableKey, parsed.data);
    return NextResponse.json({ config });
  } catch (error) {
    console.error("Update table filter config error:", error);
    return NextResponse.json(
      { error: "Failed to update table filter config" },
      { status: 500 }
    );
  }
}
