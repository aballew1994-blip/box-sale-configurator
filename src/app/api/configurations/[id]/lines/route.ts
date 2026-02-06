import { NextRequest, NextResponse } from "next/server";
import { addLineItemSchema } from "@/lib/schemas/lineItem";
import { addLineItem } from "@/lib/services/configuration";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = addLineItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const lineItem = await addLineItem(id, parsed.data);
    return NextResponse.json({ lineItem }, { status: 201 });
  } catch (error) {
    console.error("Add line item error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to add line item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
