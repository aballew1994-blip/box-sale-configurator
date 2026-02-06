import { NextRequest, NextResponse } from "next/server";
import { submitConfiguration } from "@/lib/services/submission";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const submission = await submitConfiguration(id);
    return NextResponse.json({ submission });
  } catch (error) {
    console.error("Submit configuration error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to submit configuration";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
