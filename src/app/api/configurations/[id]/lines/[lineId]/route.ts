import { NextRequest, NextResponse } from "next/server";
import { updateLineItemSchema } from "@/lib/schemas/lineItem";
import {
  updateLineItem,
  deleteLineItem,
} from "@/lib/services/configuration";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lineId: string }> }
) {
  const { lineId } = await params;

  try {
    const body = await request.json();
    const parsed = updateLineItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const lineItem = await updateLineItem(lineId, parsed.data);
    return NextResponse.json({ lineItem });
  } catch (error) {
    console.error("Update line item error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update line item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; lineId: string }> }
) {
  const { lineId } = await params;

  try {
    await deleteLineItem(lineId);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Delete line item error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete line item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
