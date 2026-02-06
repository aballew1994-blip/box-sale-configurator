import { NextRequest, NextResponse } from "next/server";
import { addProjectLineItemSchema } from "@/lib/schemas/projectLineItem";
import { addProjectLineItem } from "@/lib/services/projectConfiguration";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = addProjectLineItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const lineItem = await addProjectLineItem(id, parsed.data);
    return NextResponse.json({ lineItem }, { status: 201 });
  } catch (error) {
    console.error("Add project line item error:", error);
    return NextResponse.json(
      { error: "Failed to add project line item" },
      { status: 500 }
    );
  }
}
