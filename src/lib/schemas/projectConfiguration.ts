import { z } from "zod/v4";

export const createProjectConfigurationSchema = z.object({
  estimateId: z.string().min(1, "Estimate ID is required"),
});

export const updateProjectConfigurationSchema = z.object({
  // === Customer Information ===
  customerType: z
    .enum(["END_USER_EXISTING", "END_USER_NEW", "GC_EXISTING", "GC_NEW"])
    .optional(),
  acknowledgeNewClientForm: z.boolean().optional(),
  isOUS: z.boolean().optional(),
  hasLocalCostsVAT: z.boolean().optional(),

  // === Resource Information ===
  subRequired: z.boolean().optional(),
  subQuote: z.boolean().optional(),
  specialWorkingHours: z.boolean().optional(),
  specialWorkingHoursDetails: z.string().optional(),
  unionLabor: z.boolean().optional(),
  prevailingWage: z.boolean().optional(),
  additionalScreening: z.boolean().optional(),
  additionalScreeningDetails: z.string().optional(),
  proServicesOrSA: z.boolean().optional(),
  proServicesLocation: z.enum(["REMOTE", "ONSITE", "BOTH"]).optional(),
  remoteAccessMethod: z
    .enum([
      "CLIENT_PROVIDED_LAPTOP",
      "CLIENT_PROVIDED_VPN",
      "SCREENSHARE_ANYDESK",
      "SCREENSHARE_MS_TEAMS",
      "SCREENSHARE_TEAMVIEWER",
      "SCREENSHARE_WEBEX",
      "SCREENSHARE_ZOOM",
      "SECURELINK_CUSTOMER",
      "SECURELINK_TSI",
    ])
    .optional(),
  trainingType: z
    .enum(["TECHNICIAN", "PROFESSIONAL_SERVICES", "SOLUTIONS_ARCHITECT", "OTHER"])
    .optional(),

  // === Installation Details ===
  liftPlatformLadder: z.boolean().optional(),
  liftPlatformLadderDetails: z.string().optional(),
  dustContainment: z.boolean().optional(),
  dustContainmentDetails: z.string().optional(),
  conduit: z.boolean().optional(),
  conduitDetails: z.string().optional(),
  fireCaulk: z.boolean().optional(),
  fireCaulkDetails: z.string().optional(),
  fireAlarmRelay: z.boolean().optional(),
  fireAlarmRelayDetails: z.string().optional(),
  permits: z.boolean().optional(),
  permitsDetails: z.string().optional(),
  siteOwlDrawing: z.boolean().optional(),
  siteOwlDrawingDetails: z.string().optional(),
  certOfInsurance: z.boolean().optional(),
  certOfInsuranceDetails: z.string().optional(),
  badgingRequired: z.boolean().optional(),
  badgingRequiredDetails: z.string().optional(),
  specialInstructions: z.string().optional(),

  // === Post Installation ===
  postInstallPlan: z
    .enum(["FOCUS", "WARRANTY", "TIME_AND_MATERIALS", "NOT_APPLICABLE"])
    .optional(),
  focusAmount: z.number().min(0).optional(),
  includeFocusInProject: z.boolean().optional(),

  // === Materials Toggles ===
  accessControlCards: z.boolean().optional(),
  allowCustomMargin: z.boolean().optional(),
  licensingSSA: z.boolean().optional(),
  saas: z.boolean().optional(),

  // ACS Card Details
  acsFormat: z.string().optional(),
  acsFacilityCode: z.string().optional(),
  acsQuantity: z.number().int().min(1).optional(),
  acsStartNumber: z.number().int().min(0).optional(),
  acsEndNumber: z.number().int().min(0).optional(),

  // Licensing & SSA
  systemId: z.string().optional(),

  // SaaS Details
  saasTerm: z.number().int().min(1).max(5).optional(),
  saasStartDate: z.string().optional().or(z.literal("")).or(z.null()),
  saasEndDate: z.string().optional().or(z.literal("")).or(z.null()),
  saasEffectiveDateNotes: z.string().optional(),
  saasBillingSchedule: z
    .enum(["annual", "monthly", "quarterly", "semi_annual", "other"])
    .optional(),

  // Indirect Cost
  indirectCost: z.number().min(0).optional(),
  indirectCostOverride: z.boolean().optional(),

  // === Scope of Work ===
  installationScope: z.string().optional(),
  customerProvidedScope: z.string().optional(),
  proServicesScope: z.string().optional(),
  solutionsArchitectScope: z.string().optional(),
  constraintsAssumptions: z.string().optional(),
  exclusions: z.string().optional(),
  focusScope: z.string().optional(),

  // === Proposal Details ===
  contactFirstName: z.string().optional(),
  contactLastName: z.string().optional(),
  contactEmail: z.email().optional().or(z.literal("")),
  introduction: z.string().optional(),
  termsType: z.enum(["CUSTOM_TERMS", "EXISTING_MSA", "STANDARD"]).optional(),

  // Pricing
  defaultMargin: z.number().min(0).max(1).optional(),
});

export type CreateProjectConfigurationInput = z.infer<
  typeof createProjectConfigurationSchema
>;
export type UpdateProjectConfigurationInput = z.infer<
  typeof updateProjectConfigurationSchema
>;
