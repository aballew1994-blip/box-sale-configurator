import { NextRequest, NextResponse } from "next/server";
import { updateProjectLineItemSchema } from "@/lib/schemas/projectLineItem";
import {
  updateProjectLineItem,
  deleteProjectLineItem,
} from "@/lib/services/projectConfiguration";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lineId: string }> }
) {
  const { lineId } = await params;

  try {
    const body = await request.json();
    const parsed = updateProjectLineItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const lineItem = await updateProjectLineItem(lineId, parsed.data);
    return NextResponse.json({ lineItem });
  } catch (error) {
    console.error("Update project line item error:", error);
    return NextResponse.json(
      { error: "Failed to update project line item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; lineId: string }> }
) {
  const { lineId } = await params;

  try {
    await deleteProjectLineItem(lineId);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Delete project line item error:", error);
    return NextResponse.json(
      { error: "Failed to delete project line item" },
      { status: 500 }
    );
  }
}
