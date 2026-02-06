import { z } from "zod/v4";

export const addLineItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  partNumber: z.string().min(1, "Part number is required"),
  manufacturer: z.string().optional(),
  description: z.string().optional(),
  quantity: z.int().min(1, "Quantity must be at least 1"),
  unitCost: z.number().min(0, "Cost must be non-negative"),
  productPrice: z.number().min(0).optional(),
  targetMargin: z.number().min(0).max(1).optional(),
  tariffPercent: z.number().min(0).max(100).optional(),
});

export const updateLineItemSchema = z.object({
  quantity: z.int().min(1).optional(),
  productPrice: z.number().min(0).optional(),
  priceOverride: z.boolean().optional(),
  targetMargin: z.number().min(0).max(1).optional(),
  tariffPercent: z.number().min(0).max(100).optional(),
});

export type AddLineItemInput = z.infer<typeof addLineItemSchema>;
export type UpdateLineItemInput = z.infer<typeof updateLineItemSchema>;
