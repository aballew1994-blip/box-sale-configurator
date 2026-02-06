import { NextRequest, NextResponse } from "next/server";
import { updateProjectLocationSchema } from "@/lib/schemas/projectLocation";
import {
  updateProjectLocation,
  deleteProjectLocation,
} from "@/lib/services/projectConfiguration";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; locationId: string }> }
) {
  const { locationId } = await params;

  try {
    const body = await request.json();
    const parsed = updateProjectLocationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const location = await updateProjectLocation(locationId, parsed.data);
    return NextResponse.json({ location });
  } catch (error) {
    console.error("Update project location error:", error);
    return NextResponse.json(
      { error: "Failed to update project location" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; locationId: string }> }
) {
  const { locationId } = await params;

  try {
    await deleteProjectLocation(locationId);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Delete project location error:", error);
    return NextResponse.json(
      { error: "Failed to delete project location" },
      { status: 500 }
    );
  }
}
