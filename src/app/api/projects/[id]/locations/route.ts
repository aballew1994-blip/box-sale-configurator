import { NextRequest, NextResponse } from "next/server";
import { createProjectLocationSchema } from "@/lib/schemas/projectLocation";
import {
  getProjectLocations,
  createProjectLocation,
} from "@/lib/services/projectConfiguration";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const locations = await getProjectLocations(id);
    return NextResponse.json({ locations });
  } catch (error) {
    console.error("Get project locations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project locations" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = createProjectLocationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const location = await createProjectLocation(id, parsed.data.name);
    return NextResponse.json({ location }, { status: 201 });
  } catch (error) {
    console.error("Create project location error:", error);
    return NextResponse.json(
      { error: "Failed to create project location" },
      { status: 500 }
    );
  }
}
