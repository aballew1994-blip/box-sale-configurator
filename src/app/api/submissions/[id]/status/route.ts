import { NextRequest, NextResponse } from "next/server";
import { getSubmissionStatus } from "@/lib/services/submission";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const submission = await getSubmissionStatus(id);
    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ submission });
  } catch (error) {
    console.error("Get submission status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission status" },
      { status: 500 }
    );
  }
}
