import { NextRequest, NextResponse } from "next/server";
import { createConfigurationSchema } from "@/lib/schemas/configuration";
import { createConfiguration } from "@/lib/services/configuration";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createConfigurationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const config = await createConfiguration(parsed.data.estimateId);
    return NextResponse.json({ configuration: config }, { status: 201 });
  } catch (error) {
    console.error("Create configuration error:", error);
    return NextResponse.json(
      { error: "Failed to create configuration" },
      { status: 500 }
    );
  }
}
