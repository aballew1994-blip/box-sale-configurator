import { prisma } from "@/lib/db";
import { getEstimate } from "@/lib/netsuite/estimates";
import { computeLineItem } from "@/lib/utils/calculations";
import type { Prisma } from "@prisma/client";
import type { AddLineItemInput, UpdateLineItemInput } from "@/lib/schemas/lineItem";

const DEFAULT_USER = "system"; // Replaced by auth user in Phase 2

/**
 * Create a new configuration for an estimate.
 * Fetches estimate + customer data from NetSuite.
 */
export async function createConfiguration(estimateId: string) {
  // Check if a config already exists for this estimate
  const existing = await prisma.configuration.findFirst({
    where: { estimateId, status: { not: "ERROR" } },
    include: { lineItems: { orderBy: { lineNumber: "asc" } } },
  });

  if (existing) {
    return existing;
  }

  // Fetch estimate + customer data from NetSuite
  const nsData = await getEstimate(estimateId);

  return prisma.configuration.create({
    data: {
      estimateId,
      estimateNumber: nsData.estimate.tranId,
      customerId: nsData.customer.internalId,
      customerName: nsData.customer.name,
      createdBy: DEFAULT_USER,
      updatedBy: DEFAULT_USER,
    },
    include: { lineItems: { orderBy: { lineNumber: "asc" } } },
  });
}

/**
 * Get configuration by ID with all line items.
 */
export async function getConfiguration(id: string) {
  return prisma.configuration.findUnique({
    where: { id },
    include: {
      lineItems: { orderBy: { lineNumber: "asc" } },
      submissions: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
}

/**
 * Update configuration fields (flags, contact info, scope, etc.)
 */
export async function updateConfiguration(
  id: string,
  data: Prisma.ConfigurationUpdateInput
) {
  return prisma.configuration.update({
    where: { id },
    data: {
      ...data,
      updatedBy: DEFAULT_USER,
      version: { increment: 1 },
    },
    include: { lineItems: { orderBy: { lineNumber: "asc" } } },
  });
}

/**
 * Add a line item to a configuration.
 * Computes pricing based on margin.
 */
export async function addLineItem(configId: string, input: AddLineItemInput) {
  const config = await prisma.configuration.findUnique({
    where: { id: configId },
    include: { lineItems: true },
  });

  if (!config) throw new Error("Configuration not found");

  const targetMargin = input.targetMargin ?? Number(config.defaultMargin);
  const computed = computeLineItem({
    unitCost: input.unitCost,
    quantity: input.quantity,
    targetMargin,
    productPrice: input.productPrice ?? 0,
    priceOverride: !!input.productPrice,
    tariffPercent: input.tariffPercent ?? 0,
  });

  const nextLineNumber =
    config.lineItems.length > 0
      ? Math.max(...config.lineItems.map((li) => li.lineNumber)) + 1
      : 1;

  const lineItem = await prisma.lineItem.create({
    data: {
      configurationId: configId,
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
      tariffPercent: input.tariffPercent ?? 0,
      tariffAmount: computed.tariffAmount,
      margin: computed.margin,
      extCost: computed.extCost,
      totalPrice: computed.totalPrice,
    },
  });

  // Bump config version
  await prisma.configuration.update({
    where: { id: configId },
    data: { updatedBy: DEFAULT_USER, version: { increment: 1 } },
  });

  return lineItem;
}

/**
 * Update a line item (quantity, price override, tariff).
 * Recomputes pricing.
 */
export async function updateLineItem(
  lineId: string,
  input: UpdateLineItemInput
) {
  const existing = await prisma.lineItem.findUnique({
    where: { id: lineId },
  });

  if (!existing) throw new Error("Line item not found");

  const quantity = input.quantity ?? existing.quantity;
  const tariffPercent = input.tariffPercent ?? Number(existing.tariffPercent);
  const priceOverride =
    input.priceOverride ?? (input.productPrice !== undefined ? true : existing.priceOverride);
  const targetMargin = input.targetMargin ?? Number(existing.targetMargin);

  const computed = computeLineItem({
    unitCost: Number(existing.unitCost),
    quantity,
    targetMargin,
    productPrice: input.productPrice ?? Number(existing.productPrice),
    priceOverride,
    tariffPercent,
  });

  const updated = await prisma.lineItem.update({
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
    },
  });

  // Bump config version
  await prisma.configuration.update({
    where: { id: existing.configurationId },
    data: { updatedBy: DEFAULT_USER, version: { increment: 1 } },
  });

  return updated;
}

/**
 * Delete a line item.
 */
export async function deleteLineItem(lineId: string) {
  const existing = await prisma.lineItem.findUnique({
    where: { id: lineId },
  });

  if (!existing) throw new Error("Line item not found");

  await prisma.lineItem.delete({ where: { id: lineId } });

  // Bump config version
  await prisma.configuration.update({
    where: { id: existing.configurationId },
    data: { updatedBy: DEFAULT_USER, version: { increment: 1 } },
  });

  return { deleted: true };
}
