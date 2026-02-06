import { NextRequest, NextResponse } from "next/server";
import { createFieldConfigSchema } from "@/lib/schemas/adminConfig";
import {
  getFieldConfigs,
  createFieldConfig,
  seedDefaultConfigs,
} from "@/lib/services/adminConfig";

export async function GET(request: NextRequest) {
  try {
    const section = request.nextUrl.searchParams.get("section") || undefined;

    // Auto-seed if no configs exist
    let configs = await getFieldConfigs(section);
    if (configs.length === 0) {
      await seedDefaultConfigs();
      configs = await getFieldConfigs(section);
    }

    return NextResponse.json({ fields: configs });
  } catch (error) {
    console.error("Get field configs error:", error);
    return NextResponse.json(
      { error: "Failed to get field configs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createFieldConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const field = await createFieldConfig(parsed.data);
    return NextResponse.json({ field }, { status: 201 });
  } catch (error) {
    console.error("Create field config error:", error);
    return NextResponse.json(
      { error: "Failed to create field config" },
      { status: 500 }
    );
  }
}
