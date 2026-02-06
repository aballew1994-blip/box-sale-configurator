import type { ProjectConfiguration, ProjectLineItem } from "@/lib/api-client";

export interface ProjectSummaryComputed {
  // Category totals
  materials: number;
  subcontractorMaterials: number;
  labor: number;
  subcontractorLabor: number;

  // Equipment cost (for indirect calculation)
  equipmentCost: number;

  // Indirect cost
  indirectCost: number;

  // FOCUS
  focusAmount: number;

  // Grand total
  total: number;

  // Counts
  tsiPartsCount: number;
  subPartsCount: number;
  laborItemsCount: number;
  totalQuantity: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Calculate indirect cost (default 15% of equipment)
 */
export function calculateIndirectCost(equipmentCost: number): number {
  return round2(equipmentCost * 0.15);
}

/**
 * Compute project summary from configuration
 */
export function computeProjectSummary(
  config: ProjectConfiguration
): ProjectSummaryComputed {
  const lineItems = config.lineItems || [];

  // Group line items by category
  const tsiParts = lineItems.filter((li) => li.category === "TSI_PROVIDED_PARTS");
  const subParts = lineItems.filter((li) => li.category === "SUBCONTRACTOR_PARTS");
  const installationLabor = lineItems.filter((li) => li.category === "INSTALLATION_LABOR");
  const subcontractorLabor = lineItems.filter((li) => li.category === "SUBCONTRACTOR_LABOR");
  const projectManagement = lineItems.filter((li) => li.category === "PROJECT_MANAGEMENT");
  const miscLabor = lineItems.filter((li) => li.category === "MISC_LABOR");
  const travelCosts = lineItems.filter((li) => li.category === "TRAVEL_COSTS");

  // Calculate totals
  const sumTotalPrice = (items: ProjectLineItem[]) =>
    items.reduce((sum, li) => sum + Number(li.totalPrice), 0);

  const sumExtCost = (items: ProjectLineItem[]) =>
    items.reduce((sum, li) => sum + Number(li.extCost), 0);

  const sumQuantity = (items: ProjectLineItem[]) =>
    items.reduce((sum, li) => sum + li.quantity, 0);

  // Materials = TSI Provided Parts
  const materials = round2(sumTotalPrice(tsiParts));

  // Subcontractor Materials = Subcontractor Provided Parts
  const subcontractorMaterials = round2(sumTotalPrice(subParts));

  // Labor = Installation + Project Management + Misc + Travel
  const labor = round2(
    sumTotalPrice(installationLabor) +
      sumTotalPrice(projectManagement) +
      sumTotalPrice(miscLabor) +
      sumTotalPrice(travelCosts)
  );

  // Subcontractor Labor
  const subLabor = round2(sumTotalPrice(subcontractorLabor));

  // Equipment cost (for indirect calculation) = TSI parts extCost
  const equipmentCost = round2(sumExtCost(tsiParts));

  // Indirect cost - use override if set, otherwise calculate 15%
  const indirectCost = config.indirectCostOverride
    ? round2(Number(config.indirectCost))
    : calculateIndirectCost(equipmentCost);

  // FOCUS amount (only if included in project)
  const focusAmount =
    config.includeFocusInProject && config.focusAmount
      ? round2(Number(config.focusAmount))
      : 0;

  // Grand total
  const total = round2(
    materials + subcontractorMaterials + labor + subLabor + indirectCost + focusAmount
  );

  // Counts
  const tsiPartsCount = tsiParts.length;
  const subPartsCount = subParts.length;
  const laborItemsCount =
    installationLabor.length +
    subcontractorLabor.length +
    projectManagement.length +
    miscLabor.length +
    travelCosts.length;
  const totalQuantity = sumQuantity(lineItems);

  return {
    materials,
    subcontractorMaterials,
    labor,
    subcontractorLabor: subLabor,
    equipmentCost,
    indirectCost,
    focusAmount,
    total,
    tsiPartsCount,
    subPartsCount,
    laborItemsCount,
    totalQuantity,
  };
}
