import { NextRequest, NextResponse } from "next/server";
import { getFieldConfig } from "@/lib/services/adminConfig";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fieldKey: string }> }
) {
  try {
    const { fieldKey } = await params;
    const field = await getFieldConfig(fieldKey);

    if (!field) {
      return NextResponse.json(
        { error: "Field not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ field });
  } catch (error) {
    console.error("Failed to fetch field config:", error);
    return NextResponse.json(
      { error: "Failed to fetch field config" },
      { status: 500 }
    );
  }
}
