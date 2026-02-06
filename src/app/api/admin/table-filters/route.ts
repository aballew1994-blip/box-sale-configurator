import { NextResponse } from "next/server";
import { getTableFilterConfigs, seedDefaultConfigs } from "@/lib/services/adminConfig";

export async function GET() {
  try {
    // Auto-seed if no configs exist
    const configs = await getTableFilterConfigs();
    if (configs.length === 0) {
      await seedDefaultConfigs();
      const seeded = await getTableFilterConfigs();
      return NextResponse.json({ configs: seeded });
    }
    return NextResponse.json({ configs });
  } catch (error) {
    console.error("Get table filter configs error:", error);
    return NextResponse.json(
      { error: "Failed to get table filter configs" },
      { status: 500 }
    );
  }
}
