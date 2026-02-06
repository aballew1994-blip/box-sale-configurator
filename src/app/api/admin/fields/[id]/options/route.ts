import { NextRequest, NextResponse } from "next/server";
import {
  createOptionSchema,
  reorderOptionsSchema,
} from "@/lib/schemas/adminConfig";
import {
  createFieldOption,
  reorderFieldOptions,
} from "@/lib/services/adminConfig";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: fieldId } = await params;
  try {
    const body = await request.json();
    const parsed = createOptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const option = await createFieldOption(fieldId, parsed.data);
    return NextResponse.json({ option }, { status: 201 });
  } catch (error) {
    console.error("Create field option error:", error);
    return NextResponse.json(
      { error: "Failed to create field option" },
      { status: 500 }
    );
  }
}

// PATCH for reordering options
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: fieldId } = await params;
  try {
    const body = await request.json();
    const parsed = reorderOptionsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    await reorderFieldOptions(fieldId, parsed.data.optionIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder field options error:", error);
    return NextResponse.json(
      { error: "Failed to reorder field options" },
      { status: 500 }
    );
  }
}
