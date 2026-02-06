import { NextRequest, NextResponse } from "next/server";
import { createProjectConfigurationSchema } from "@/lib/schemas/projectConfiguration";
import { createProjectConfiguration } from "@/lib/services/projectConfiguration";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createProjectConfigurationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const config = await createProjectConfiguration(parsed.data.estimateId);
    return NextResponse.json({ configuration: config }, { status: 201 });
  } catch (error) {
    console.error("Create project configuration error:", error);
    return NextResponse.json(
      { error: "Failed to create project configuration" },
      { status: 500 }
    );
  }
}
