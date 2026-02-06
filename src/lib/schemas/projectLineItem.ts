import { z } from "zod/v4";

export const addProjectLineItemSchema = z.object({
  category: z.enum([
    "TSI_PROVIDED_PARTS",
    "SUBCONTRACTOR_PARTS",
    "INSTALLATION_LABOR",
    "SUBCONTRACTOR_LABOR",
    "PROJECT_MANAGEMENT",
    "MISC_LABOR",
    "TRAVEL_COSTS",
  ]),
  itemId: z.string().min(1, "Item ID is required"),
  partNumber: z.string().min(1, "Part number is required"),
  manufacturer: z.string().optional(),
  description: z.string().optional(),
  quantity: z.int().min(1, "Quantity must be at least 1"),
  unitCost: z.number().min(0, "Cost must be non-negative"),
  productPrice: z.number().min(0).optional(),
  targetMargin: z.number().min(0).max(1).optional(),
  tariffPercent: z.number().min(0).max(100).optional(),
  locationId: z.string().optional(),
});

export const updateProjectLineItemSchema = z.object({
  quantity: z.int().min(1).optional(),
  productPrice: z.number().min(0).optional(),
  priceOverride: z.boolean().optional(),
  targetMargin: z.number().min(0).max(1).optional(),
  tariffPercent: z.number().min(0).max(100).optional(),
  locationId: z.string().optional().or(z.null()),
});

export type AddProjectLineItemInput = z.infer<typeof addProjectLineItemSchema>;
export type UpdateProjectLineItemInput = z.infer<typeof updateProjectLineItemSchema>;
