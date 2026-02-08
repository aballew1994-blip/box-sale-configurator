import { NextRequest, NextResponse } from "next/server";
import { updateManufacturerTariffSchema } from "@/lib/schemas/manufacturerTariff";
import {
  getManufacturerTariff,
  updateManufacturerTariff,
  deleteManufacturerTariff,
} from "@/lib/services/manufacturerTariff";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const tariff = await getManufacturerTariff(id);
    if (!tariff) {
      return NextResponse.json(
        { error: "Manufacturer tariff not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ tariff });
  } catch (error) {
    console.error("Get manufacturer tariff error:", error);
    return NextResponse.json(
      { error: "Failed to get manufacturer tariff" },
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
    const parsed = updateManufacturerTariffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const tariff = await updateManufacturerTariff(id, parsed.data);
    return NextResponse.json({ tariff });
  } catch (error: unknown) {
    console.error("Update manufacturer tariff error:", error);

    // Handle unique constraint violation
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A tariff for this manufacturer already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update manufacturer tariff" },
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
    await deleteManufacturerTariff(id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Delete manufacturer tariff error:", error);
    return NextResponse.json(
      { error: "Failed to delete manufacturer tariff" },
      { status: 500 }
    );
  }
}
