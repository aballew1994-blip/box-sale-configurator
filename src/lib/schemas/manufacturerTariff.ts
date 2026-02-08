import { z } from "zod/v4";

export const createManufacturerTariffSchema = z.object({
  manufacturer: z.string().min(1, "Manufacturer name is required").max(100),
  tariffPercent: z.number().min(0).max(99.99),
  isEnabled: z.boolean().optional().default(true),
  netsuiteItemId: z.string().nullable().optional(),
  netsuiteItemNumber: z.string().nullable().optional(),
});

export type CreateManufacturerTariffInput = z.infer<typeof createManufacturerTariffSchema>;

export const updateManufacturerTariffSchema = z.object({
  manufacturer: z.string().min(1).max(100).optional(),
  tariffPercent: z.number().min(0).max(99.99).optional(),
  isEnabled: z.boolean().optional(),
  netsuiteItemId: z.string().nullable().optional(),
  netsuiteItemNumber: z.string().nullable().optional(),
});

export type UpdateManufacturerTariffInput = z.infer<typeof updateManufacturerTariffSchema>;
