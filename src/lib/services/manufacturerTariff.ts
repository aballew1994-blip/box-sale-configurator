import { prisma } from "@/lib/db";
import type {
  CreateManufacturerTariffInput,
  UpdateManufacturerTariffInput,
} from "@/lib/schemas/manufacturerTariff";

const DEFAULT_USER = "system";

// ============================================================
// MANUFACTURER TARIFF
// ============================================================

/**
 * Get all manufacturer tariffs (for admin view)
 */
export async function getAllManufacturerTariffs() {
  return prisma.manufacturerTariff.findMany({
    orderBy: { manufacturer: "asc" },
  });
}

/**
 * Get only enabled manufacturer tariffs
 */
export async function getEnabledManufacturerTariffs() {
  return prisma.manufacturerTariff.findMany({
    where: { isEnabled: true },
    orderBy: { manufacturer: "asc" },
  });
}

/**
 * Get single tariff by ID
 */
export async function getManufacturerTariff(id: string) {
  return prisma.manufacturerTariff.findUnique({
    where: { id },
  });
}

/**
 * Lookup tariff percentage by manufacturer name (case-insensitive)
 * Returns 0 if not found or disabled
 */
export async function lookupTariffByManufacturer(manufacturer: string): Promise<number> {
  if (!manufacturer) return 0;

  const tariff = await prisma.manufacturerTariff.findFirst({
    where: {
      manufacturer: { equals: manufacturer, mode: "insensitive" },
      isEnabled: true,
    },
  });

  return tariff ? Number(tariff.tariffPercent) : 0;
}

/**
 * Create new manufacturer tariff
 */
export async function createManufacturerTariff(data: CreateManufacturerTariffInput) {
  return prisma.manufacturerTariff.create({
    data: {
      manufacturer: data.manufacturer,
      tariffPercent: data.tariffPercent,
      isEnabled: data.isEnabled ?? true,
      netsuiteItemId: data.netsuiteItemId ?? null,
      netsuiteItemNumber: data.netsuiteItemNumber ?? null,
      createdBy: DEFAULT_USER,
      updatedBy: DEFAULT_USER,
    },
  });
}

/**
 * Update manufacturer tariff
 */
export async function updateManufacturerTariff(
  id: string,
  data: UpdateManufacturerTariffInput
) {
  return prisma.manufacturerTariff.update({
    where: { id },
    data: {
      ...data,
      updatedBy: DEFAULT_USER,
    },
  });
}

/**
 * Delete manufacturer tariff
 */
export async function deleteManufacturerTariff(id: string) {
  return prisma.manufacturerTariff.delete({
    where: { id },
  });
}

/**
 * Get tariffs with NetSuite mapping (for future consolidation feature)
 */
export async function getTariffsWithNetSuiteMapping() {
  return prisma.manufacturerTariff.findMany({
    where: {
      isEnabled: true,
      netsuiteItemId: { not: null },
    },
    orderBy: { manufacturer: "asc" },
  });
}
