import Papa from "papaparse";
import type { CsvImportRow, CsvImportError } from "@/types";

interface ParsedCsvRow {
  [key: string]: string;
}

/**
 * Parse a CSV file/string and extract part numbers + quantities.
 * Expected columns: "Part Number" (or "PartNumber", "part_number", "Part #")
 *                   "Quantity" (or "Qty", "qty", "quantity")
 */
export function parseCsvContent(csvContent: string): {
  rows: CsvImportRow[];
  errors: CsvImportError[];
} {
  const rows: CsvImportRow[] = [];
  const errors: CsvImportError[] = [];

  const result = Papa.parse<ParsedCsvRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  });

  if (result.errors.length > 0) {
    for (const err of result.errors) {
      errors.push({
        row: (err.row ?? 0) + 1,
        partNumber: "",
        message: err.message,
      });
    }
  }

  for (let i = 0; i < result.data.length; i++) {
    const raw = result.data[i];
    const rowNum = i + 2; // 1-indexed, +1 for header

    // Find part number column (flexible naming)
    const partNumber = findColumnValue(raw, [
      "Part Number",
      "PartNumber",
      "part_number",
      "Part #",
      "Part#",
      "partNumber",
      "Item",
      "ItemId",
    ]);

    // Find quantity column
    const qtyStr = findColumnValue(raw, [
      "Quantity",
      "Qty",
      "qty",
      "quantity",
      "QTY",
      "Count",
    ]);

    if (!partNumber) {
      errors.push({
        row: rowNum,
        partNumber: "",
        message: "Missing part number",
      });
      continue;
    }

    const quantity = parseInt(qtyStr || "1", 10);
    if (isNaN(quantity) || quantity < 1) {
      errors.push({
        row: rowNum,
        partNumber,
        message: `Invalid quantity: "${qtyStr}"`,
      });
      continue;
    }

    rows.push({ partNumber: partNumber.trim(), quantity });
  }

  return { rows, errors };
}

function findColumnValue(
  row: ParsedCsvRow,
  possibleNames: string[]
): string | undefined {
  for (const name of possibleNames) {
    // Check exact match
    if (row[name] !== undefined && row[name] !== "") {
      return row[name];
    }
    // Check case-insensitive match
    const key = Object.keys(row).find(
      (k) => k.toLowerCase() === name.toLowerCase()
    );
    if (key && row[key] !== undefined && row[key] !== "") {
      return row[key];
    }
  }
  return undefined;
}
