import { NextRequest, NextResponse } from "next/server";
import { updateOptionSchema } from "@/lib/schemas/adminConfig";
import {
  updateFieldOption,
  deleteFieldOption,
} from "@/lib/services/adminConfig";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; optionId: string }> }
) {
  const { optionId } = await params;
  try {
    const body = await request.json();
    const parsed = updateOptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const option = await updateFieldOption(optionId, parsed.data);
    return NextResponse.json({ option });
  } catch (error) {
    console.error("Update field option error:", error);
    return NextResponse.json(
      { error: "Failed to update field option" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; optionId: string }> }
) {
  const { optionId } = await params;
  try {
    await deleteFieldOption(optionId);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Delete field option error:", error);
    return NextResponse.json(
      { error: "Failed to delete field option" },
      { status: 500 }
    );
  }
}
