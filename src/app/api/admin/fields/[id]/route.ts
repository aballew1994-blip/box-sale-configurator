import { NextRequest, NextResponse } from "next/server";
import { updateFieldConfigSchema } from "@/lib/schemas/adminConfig";
import {
  getFieldConfigById,
  updateFieldConfig,
  deleteFieldConfig,
} from "@/lib/services/adminConfig";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const field = await getFieldConfigById(id);
    if (!field) {
      return NextResponse.json(
        { error: "Field config not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ field });
  } catch (error) {
    console.error("Get field config error:", error);
    return NextResponse.json(
      { error: "Failed to get field config" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = updateFieldConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const field = await updateFieldConfig(id, parsed.data);
    return NextResponse.json({ field });
  } catch (error) {
    console.error("Update field config error:", error);
    return NextResponse.json(
      { error: "Failed to update field config" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await deleteFieldConfig(id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Delete field config error:", error);
    return NextResponse.json(
      { error: "Failed to delete field config" },
      { status: 500 }
    );
  }
}
