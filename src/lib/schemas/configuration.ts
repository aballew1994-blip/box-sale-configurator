import { z } from "zod/v4";

export const createConfigurationSchema = z.object({
  estimateId: z.string().min(1, "Estimate ID is required"),
});

export const updateConfigurationSchema = z.object({
  accessControlCards: z.boolean().optional(),
  allowCustomMargin: z.boolean().optional(),
  licensingSSA: z.boolean().optional(),
  saas: z.boolean().optional(),
  defaultMargin: z.number().min(0).max(1).optional(),
  contactFirstName: z.string().optional(),
  contactLastName: z.string().optional(),
  contactEmail: z.email().optional().or(z.literal("")),
  scopeOfWork: z.string().optional(),
  proposalSummary: z.string().optional(),
  shippingFee: z.number().min(0).optional(),
  shippingOverride: z.boolean().optional(),

  // ACS Card fields
  acsFormat: z.string().optional(),
  acsFacilityCode: z.string().optional(),
  acsQuantity: z.number().int().min(1).optional(),
  acsStartNumber: z.number().int().min(0).optional(),
  acsEndNumber: z.number().int().min(0).optional(),

  // Licensing & SSA fields
  systemId: z.string().optional(),

  // SaaS fields
  saasTerm: z.number().int().min(1).max(5).optional(),
  saasStartDate: z.string().optional().or(z.literal("")).or(z.null()),
  saasEndDate: z.string().optional().or(z.literal("")).or(z.null()),
  saasEffectiveDateNotes: z.string().optional(),
  saasBillingSchedule: z
    .enum(["annual", "monthly", "quarterly", "semi_annual", "other"])
    .optional(),
});

export type CreateConfigurationInput = z.infer<typeof createConfigurationSchema>;
export type UpdateConfigurationInput = z.infer<typeof updateConfigurationSchema>;
