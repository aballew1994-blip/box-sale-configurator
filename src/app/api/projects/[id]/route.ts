import { NextRequest, NextResponse } from "next/server";
import { updateProjectConfigurationSchema } from "@/lib/schemas/projectConfiguration";
import {
  getProjectConfiguration,
  updateProjectConfiguration,
} from "@/lib/services/projectConfiguration";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const config = await getProjectConfiguration(id);
    if (!config) {
      return NextResponse.json(
        { error: "Project configuration not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ configuration: config });
  } catch (error) {
    console.error("Get project configuration error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project configuration" },
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
    const parsed = updateProjectConfigurationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const config = await updateProjectConfiguration(id, parsed.data);
    return NextResponse.json({ configuration: config });
  } catch (error) {
    console.error("Update project configuration error:", error);
    return NextResponse.json(
      { error: "Failed to update project configuration" },
      { status: 500 }
    );
  }
}
