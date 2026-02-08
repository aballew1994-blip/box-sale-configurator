import { NextRequest, NextResponse } from "next/server";
import { createManufacturerTariffSchema } from "@/lib/schemas/manufacturerTariff";
import {
  getAllManufacturerTariffs,
  createManufacturerTariff,
} from "@/lib/services/manufacturerTariff";

export async function GET() {
  try {
    const tariffs = await getAllManufacturerTariffs();
    return NextResponse.json({ tariffs });
  } catch (error) {
    console.error("Get manufacturer tariffs error:", error);
    return NextResponse.json(
      { error: "Failed to get manufacturer tariffs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createManufacturerTariffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const tariff = await createManufacturerTariff(parsed.data);
    return NextResponse.json({ tariff }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create manufacturer tariff error:", error);

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
      { error: "Failed to create manufacturer tariff" },
      { status: 500 }
    );
  }
}
