import { NextRequest, NextResponse } from "next/server";
import { parseCsvContent } from "@/lib/utils/csv-parser";
import { addLineItem } from "@/lib/services/configuration";
import { getItem } from "@/lib/netsuite/items";
import type { CsvImportError } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const csvContent = await file.text();
    const { rows, errors } = parseCsvContent(csvContent);
    const importErrors: CsvImportError[] = [...errors];
    let added = 0;

    for (const row of rows) {
      try {
        // Look up the item in NetSuite
        const item = await getItem(row.partNumber);

        if (!item) {
          importErrors.push({
            row: rows.indexOf(row) + 2,
            partNumber: row.partNumber,
            message: `Item not found: ${row.partNumber}`,
          });
          continue;
        }

        if (!item.isActive) {
          importErrors.push({
            row: rows.indexOf(row) + 2,
            partNumber: row.partNumber,
            message: `Item is inactive: ${row.partNumber}`,
          });
          continue;
        }

        await addLineItem(id, {
          itemId: item.internalId,
          partNumber: item.itemId,
          manufacturer: item.manufacturer,
          description: item.description,
          quantity: row.quantity,
          unitCost: item.cost,
        });

        added++;
      } catch (error) {
        importErrors.push({
          row: rows.indexOf(row) + 2,
          partNumber: row.partNumber,
          message:
            error instanceof Error ? error.message : "Failed to add item",
        });
      }
    }

    return NextResponse.json({ added, errors: importErrors });
  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json(
      { error: "Failed to process CSV import" },
      { status: 500 }
    );
  }
}
