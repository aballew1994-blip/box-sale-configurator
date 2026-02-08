import { NextRequest, NextResponse } from "next/server";
import { generateProjectProposal } from "@/lib/services/projectProposal";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const pdfBuffer = await generateProjectProposal(id);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="proposal-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Generate project proposal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate proposal" },
      { status: 500 }
    );
  }
}
