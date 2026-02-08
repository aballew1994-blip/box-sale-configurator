import { NextRequest, NextResponse } from "next/server";
import { lookupTariffByManufacturer } from "@/lib/services/manufacturerTariff";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ manufacturer: string }> }
) {
  const { manufacturer } = await params;
  try {
    const decodedManufacturer = decodeURIComponent(manufacturer);
    const tariffPercent = await lookupTariffByManufacturer(decodedManufacturer);

    return NextResponse.json({
      manufacturer: decodedManufacturer,
      tariffPercent,
      found: tariffPercent > 0,
    });
  } catch (error) {
    console.error("Lookup manufacturer tariff error:", error);
    return NextResponse.json(
      { error: "Failed to lookup manufacturer tariff" },
      { status: 500 }
    );
  }
}
