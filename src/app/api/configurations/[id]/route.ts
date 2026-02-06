import { NextRequest, NextResponse } from "next/server";
import { updateConfigurationSchema } from "@/lib/schemas/configuration";
import {
  getConfiguration,
  updateConfiguration,
} from "@/lib/services/configuration";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const config = await getConfiguration(id);
    if (!config) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ configuration: config });
  } catch (error) {
    console.error("Get configuration error:", error);
    return NextResponse.json(
      { error: "Failed to fetch configuration" },
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
    const parsed = updateConfigurationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const config = await updateConfiguration(id, parsed.data);
    return NextResponse.json({ configuration: config });
  } catch (error) {
    console.error("Update configuration error:", error);
    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    );
  }
}
