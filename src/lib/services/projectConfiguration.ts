import { prisma } from "@/lib/db";
import { getEstimate } from "@/lib/netsuite/estimates";
import { computeLineItem } from "@/lib/utils/calculations";
import type { Prisma, ProjectLineCategory } from "@prisma/client";
import type {
  AddProjectLineItemInput,
  UpdateProjectLineItemInput,
} from "@/lib/schemas/projectLineItem";

const DEFAULT_USER = "system";

/**
 * Create a new project configuration for an estimate.
 * Fetches estimate + customer data from NetSuite.
 */
export async function createProjectConfiguration(estimateId: string) {
  // Check if a config already exists for this estimate
  const existing = await prisma.projectConfiguration.findFirst({
    where: { estimateId, status: { not: "ERROR" } },
    include: {
      lineItems: { orderBy: { lineNumber: "asc" } },
      locations: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (existing) {
    return existing;
  }

  // Fetch estimate + customer data from NetSuite
  const nsData = await getEstimate(estimateId);

  return prisma.projectConfiguration.create({
    data: {
      estimateId,
      estimateNumber: nsData.estimate.tranId,
      customerId: nsData.customer.internalId,
      customerName: nsData.customer.name,
      createdBy: DEFAULT_USER,
      updatedBy: DEFAULT_USER,
    },
    include: {
      lineItems: { orderBy: { lineNumber: "asc" } },
      locations: { orderBy: { sortOrder: "asc" } },
    },
  });
}

/**
 * Get project configuration by ID with all line items and locations.
 */
export async function getProjectConfiguration(id: string) {
  return prisma.projectConfiguration.findUnique({
    where: { id },
    include: {
      lineItems: {
        orderBy: { lineNumber: "asc" },
        include: { location: true },
      },
      locations: { orderBy: { sortOrder: "asc" } },
    },
  });
}

/**
 * Update project configuration fields.
 */
export async function updateProjectConfiguration(
  id: string,
  data: Prisma.ProjectConfigurationUpdateInput
) {
  return prisma.projectConfiguration.update({
    where: { id },
    data: {
      ...data,
      updatedBy: DEFAULT_USER,
      version: { increment: 1 },
    },
    include: {
      lineItems: {
        orderBy: { lineNumber: "asc" },
        include: { location: true },
      },
      locations: { orderBy: { sortOrder: "asc" } },
    },
  });
}

/**
 * Determine if a category should use tariff.
 */
function categoryUsesTariff(category: ProjectLineCategory): boolean {
  return category === "TSI_PROVIDED_PARTS";
}

/**
 * Determine if a category should use margin column (for display).
 * All categories compute margin, but some don't show the column.
 */
function categoryUsesMarginColumn(category: ProjectLineCategory): boolean {
  return [
    "TSI_PROVIDED_PARTS",
    "SUBCONTRACTOR_PARTS",
    "SUBCONTRACTOR_LABOR",
    "TRAVEL_COSTS",
  ].includes(category);
}

/**
 * Add a line item to a project configuration.
 * Computes pricing based on margin and category.
 */
export async function addProjectLineItem(
  configId: string,
  input: AddProjectLineItemInput
) {
  const config = await prisma.projectConfiguration.findUnique({
    where: { id: configId },
    include: { lineItems: true },
  });

  if (!config) throw new Error("Project configuration not found");

  // Get line items for this specific category to determine next line number
  const categoryItems = config.lineItems.filter(
    (li) => li.category === input.category
  );
  const nextLineNumber =
    categoryItems.length > 0
      ? Math.max(...categoryItems.map((li) => li.lineNumber)) + 1
      : 1;

  // Determine margin - labor items without margin column use 0 margin
  const useMarginColumn = categoryUsesMarginColumn(input.category);
  const targetMargin = useMarginColumn
    ? (input.targetMargin ?? Number(config.defaultMargin))
    : 0;

  // Determine tariff - only TSI_PROVIDED_PARTS uses tariff
  const useTariff = categoryUsesTariff(input.category);
  const tariffPercent = useTariff ? (input.tariffPercent ?? 0) : 0;

  const computed = computeLineItem({
    unitCost: input.unitCost,
    quantity: input.quantity,
    targetMargin,
    productPrice: input.productPrice ?? 0,
    priceOverride: !!input.productPrice,
    tariffPercent,
  });

  const lineItem = await prisma.projectLineItem.create({
    data: {
      configurationId: configId,
      category: input.category,
      lineNumber: nextLineNumber,
      itemId: input.itemId,
      partNumber: input.partNumber,
      manufacturer: input.manufacturer,
      description: input.description,
      quantity: input.quantity,
      unitCost: input.unitCost,
      targetMargin,
      productPrice: computed.productPrice,
      priceOverride: !!input.productPrice,
      tariffPercent,
      tariffAmount: computed.tariffAmount,
      margin: computed.margin,
      extCost: computed.extCost,
      totalPrice: computed.totalPrice,
      locationId: input.locationId,
    },
    include: { location: true },
  });

  // Bump config version
  await prisma.projectConfiguration.update({
    where: { id: configId },
    data: { updatedBy: DEFAULT_USER, version: { increment: 1 } },
  });

  return lineItem;
}

/**
 * Update a project line item.
 * Recomputes pricing.
 */
export async function updateProjectLineItem(
  lineId: string,
  input: UpdateProjectLineItemInput
) {
  const existing = await prisma.projectLineItem.findUnique({
    where: { id: lineId },
  });

  if (!existing) throw new Error("Project line item not found");

  const quantity = input.quantity ?? existing.quantity;
  const useTariff = categoryUsesTariff(existing.category);
  const tariffPercent = useTariff
    ? (input.tariffPercent ?? Number(existing.tariffPercent))
    : 0;
  const priceOverride =
    input.priceOverride ??
    (input.productPrice !== undefined ? true : existing.priceOverride);
  const targetMargin = input.targetMargin ?? Number(existing.targetMargin);

  const computed = computeLineItem({
    unitCost: Number(existing.unitCost),
    quantity,
    targetMargin,
    productPrice: input.productPrice ?? Number(existing.productPrice),
    priceOverride,
    tariffPercent,
  });

  const updated = await prisma.projectLineItem.update({
    where: { id: lineId },
    data: {
      quantity,
      targetMargin,
      productPrice: computed.productPrice,
      priceOverride,
      tariffPercent,
      tariffAmount: computed.tariffAmount,
      margin: computed.margin,
      extCost: computed.extCost,
      totalPrice: computed.totalPrice,
      locationId: input.locationId === null ? null : input.locationId,
    },
    include: { location: true },
  });

  // Bump config version
  await prisma.projectConfiguration.update({
    where: { id: existing.configurationId },
    data: { updatedBy: DEFAULT_USER, version: { increment: 1 } },
  });

  return updated;
}

/**
 * Delete a project line item.
 */
export async function deleteProjectLineItem(lineId: string) {
  const existing = await prisma.projectLineItem.findUnique({
    where: { id: lineId },
  });

  if (!existing) throw new Error("Project line item not found");

  await prisma.projectLineItem.delete({ where: { id: lineId } });

  // Bump config version
  await prisma.projectConfiguration.update({
    where: { id: existing.configurationId },
    data: { updatedBy: DEFAULT_USER, version: { increment: 1 } },
  });

  return { deleted: true };
}

/**
 * Create a location category for a project configuration.
 */
export async function createProjectLocation(configId: string, name: string) {
  const config = await prisma.projectConfiguration.findUnique({
    where: { id: configId },
    include: { locations: true },
  });

  if (!config) throw new Error("Project configuration not found");

  const nextSortOrder =
    config.locations.length > 0
      ? Math.max(...config.locations.map((l) => l.sortOrder)) + 1
      : 0;

  const location = await prisma.projectLocation.create({
    data: {
      configurationId: configId,
      name,
      sortOrder: nextSortOrder,
    },
  });

  // Bump config version
  await prisma.projectConfiguration.update({
    where: { id: configId },
    data: { updatedBy: DEFAULT_USER, version: { increment: 1 } },
  });

  return location;
}

/**
 * Update a project location.
 */
export async function updateProjectLocation(
  locationId: string,
  data: { name?: string; sortOrder?: number }
) {
  const existing = await prisma.projectLocation.findUnique({
    where: { id: locationId },
  });

  if (!existing) throw new Error("Project location not found");

  const updated = await prisma.projectLocation.update({
    where: { id: locationId },
    data,
  });

  // Bump config version
  await prisma.projectConfiguration.update({
    where: { id: existing.configurationId },
    data: { updatedBy: DEFAULT_USER, version: { increment: 1 } },
  });

  return updated;
}

/**
 * Delete a project location.
 * Line items with this location will have their locationId set to null.
 */
export async function deleteProjectLocation(locationId: string) {
  const existing = await prisma.projectLocation.findUnique({
    where: { id: locationId },
  });

  if (!existing) throw new Error("Project location not found");

  await prisma.projectLocation.delete({ where: { id: locationId } });

  // Bump config version
  await prisma.projectConfiguration.update({
    where: { id: existing.configurationId },
    data: { updatedBy: DEFAULT_USER, version: { increment: 1 } },
  });

  return { deleted: true };
}

/**
 * Get all locations for a project configuration.
 */
export async function getProjectLocations(configId: string) {
  return prisma.projectLocation.findMany({
    where: { configurationId: configId },
    orderBy: { sortOrder: "asc" },
  });
}
