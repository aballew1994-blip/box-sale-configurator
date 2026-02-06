import { NextRequest, NextResponse } from "next/server";
import { generateProposal } from "@/lib/services/proposal";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const pdfBuffer = await generateProposal(id);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="proposal-${id}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error("Generate proposal error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate proposal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
