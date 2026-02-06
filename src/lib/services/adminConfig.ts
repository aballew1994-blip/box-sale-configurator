import { prisma } from "@/lib/db";
import type {
  TableFilters,
  UpdateTableFilterConfigInput,
  CreateFieldConfigInput,
  UpdateFieldConfigInput,
  CreateOptionInput,
  UpdateOptionInput,
} from "@/lib/schemas/adminConfig";

const DEFAULT_USER = "system";

// ============================================================
// TABLE FILTER CONFIG
// ============================================================

export async function getTableFilterConfigs() {
  return prisma.tableFilterConfig.findMany({
    orderBy: { displayName: "asc" },
  });
}

export async function getTableFilterConfig(tableKey: string) {
  return prisma.tableFilterConfig.findUnique({
    where: { tableKey },
  });
}

export async function updateTableFilterConfig(
  tableKey: string,
  data: UpdateTableFilterConfigInput
) {
  return prisma.tableFilterConfig.update({
    where: { tableKey },
    data: {
      ...data,
      filters: data.filters ? JSON.parse(JSON.stringify(data.filters)) : undefined,
      updatedBy: DEFAULT_USER,
    },
  });
}

export async function getFiltersForTable(tableKey: string): Promise<TableFilters> {
  const config = await prisma.tableFilterConfig.findUnique({
    where: { tableKey },
  });

  if (!config || !config.isEnabled) {
    return {};
  }

  return config.filters as TableFilters;
}

// ============================================================
// FIELD CONFIG
// ============================================================

export async function getFieldConfigs(section?: string) {
  return prisma.fieldConfig.findMany({
    where: section ? { section } : undefined,
    include: {
      options: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
  });
}

export async function getFieldConfig(fieldKey: string) {
  return prisma.fieldConfig.findUnique({
    where: { fieldKey },
    include: {
      options: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function getFieldConfigById(id: string) {
  return prisma.fieldConfig.findUnique({
    where: { id },
    include: {
      options: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function createFieldConfig(data: CreateFieldConfigInput) {
  const { showWhen, ...rest } = data;

  return prisma.fieldConfig.create({
    data: {
      ...rest,
      showWhen: showWhen ? JSON.parse(JSON.stringify(showWhen)) : null,
      createdBy: DEFAULT_USER,
      updatedBy: DEFAULT_USER,
    },
    include: {
      options: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function updateFieldConfig(id: string, data: UpdateFieldConfigInput) {
  const { showWhen, ...rest } = data;

  return prisma.fieldConfig.update({
    where: { id },
    data: {
      ...rest,
      showWhen: showWhen !== undefined
        ? (showWhen ? JSON.parse(JSON.stringify(showWhen)) : null)
        : undefined,
      updatedBy: DEFAULT_USER,
    },
    include: {
      options: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function deleteFieldConfig(id: string) {
  return prisma.fieldConfig.delete({
    where: { id },
  });
}

// ============================================================
// FIELD OPTIONS
// ============================================================

export async function createFieldOption(fieldId: string, data: CreateOptionInput) {
  // Get max sort order
  const maxOrder = await prisma.fieldOption.aggregate({
    where: { fieldId },
    _max: { sortOrder: true },
  });

  return prisma.fieldOption.create({
    data: {
      fieldId,
      ...data,
      sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });
}

export async function updateFieldOption(optionId: string, data: UpdateOptionInput) {
  return prisma.fieldOption.update({
    where: { id: optionId },
    data,
  });
}

export async function reorderFieldOptions(fieldId: string, optionIds: string[]) {
  // Update each option's sortOrder based on position in array
  const updates = optionIds.map((id, index) =>
    prisma.fieldOption.update({
      where: { id },
      data: { sortOrder: index },
    })
  );

  return prisma.$transaction(updates);
}

export async function deleteFieldOption(optionId: string) {
  return prisma.fieldOption.delete({
    where: { id: optionId },
  });
}

// ============================================================
// SEEDING
// ============================================================

export async function seedDefaultConfigs() {
  // Seed table filters
  const tableFilters = [
    {
      tableKey: "TSI_PROVIDED_PARTS",
      displayName: "TSI Provided Parts",
      description: "Parts provided by TSI, subject to tariff",
      filters: { itemTypes: ["inventoryItem", "nonInventoryItem"] },
    },
    {
      tableKey: "SUBCONTRACTOR_PARTS",
      displayName: "Subcontractor Parts",
      description: "Parts provided by subcontractors (no tariff)",
      filters: { itemTypes: ["inventoryItem", "nonInventoryItem"] },
    },
    {
      tableKey: "INSTALLATION_LABOR",
      displayName: "Installation Labor",
      description: "Labor for installation work",
      filters: { itemTypes: ["serviceItem"] },
    },
    {
      tableKey: "SUBCONTRACTOR_LABOR",
      displayName: "Subcontractor Labor",
      description: "Labor provided by subcontractors",
      filters: { itemTypes: ["serviceItem"] },
    },
    {
      tableKey: "PROJECT_MANAGEMENT",
      displayName: "Project Management",
      description: "Project management services",
      filters: { itemTypes: ["serviceItem"] },
    },
    {
      tableKey: "MISC_LABOR",
      displayName: "Misc. Labor",
      description: "Miscellaneous labor items",
      filters: { itemTypes: ["serviceItem"] },
    },
    {
      tableKey: "TRAVEL_COSTS",
      displayName: "Travel Costs",
      description: "Travel and expenses",
      filters: { itemTypes: ["serviceItem"] },
    },
  ];

  for (const filter of tableFilters) {
    await prisma.tableFilterConfig.upsert({
      where: { tableKey: filter.tableKey },
      update: {},
      create: {
        ...filter,
        filters: filter.filters,
        createdBy: DEFAULT_USER,
        updatedBy: DEFAULT_USER,
      },
    });
  }

  // Seed field configs
  const fieldConfigs = [
    {
      fieldKey: "customerType",
      fieldType: "dropdown",
      displayName: "Customer Type",
      section: "customerInfo",
      sortOrder: 0,
      options: [
        { value: "END_USER_EXISTING", label: "End User (Existing)", sortOrder: 0 },
        { value: "END_USER_NEW", label: "End User (New)", sortOrder: 1 },
        { value: "GC_EXISTING", label: "General Contractor (Existing)", sortOrder: 2 },
        { value: "GC_NEW", label: "General Contractor (New)", sortOrder: 3 },
      ],
    },
    {
      fieldKey: "proServicesLocation",
      fieldType: "dropdown",
      displayName: "Pro Services Location",
      section: "resourceInfo",
      sortOrder: 0,
      options: [
        { value: "REMOTE", label: "Remote", sortOrder: 0 },
        { value: "ONSITE", label: "Onsite", sortOrder: 1 },
        { value: "BOTH", label: "Both", sortOrder: 2 },
      ],
    },
    {
      fieldKey: "remoteAccessMethod",
      fieldType: "dropdown",
      displayName: "Remote Access Method",
      section: "resourceInfo",
      sortOrder: 1,
      options: [
        { value: "CLIENT_PROVIDED_LAPTOP", label: "Client Provided Laptop", sortOrder: 0 },
        { value: "CLIENT_PROVIDED_VPN", label: "Client Provided VPN", sortOrder: 1 },
        { value: "SCREENSHARE_ANYDESK", label: "Screenshare (Anydesk)", sortOrder: 2 },
        { value: "SCREENSHARE_MS_TEAMS", label: "Screenshare (MS Teams)", sortOrder: 3 },
        { value: "SCREENSHARE_TEAMVIEWER", label: "Screenshare (TeamViewer)", sortOrder: 4 },
        { value: "SCREENSHARE_WEBEX", label: "Screenshare (Webex)", sortOrder: 5 },
        { value: "SCREENSHARE_ZOOM", label: "Screenshare (Zoom)", sortOrder: 6 },
        { value: "SECURELINK_CUSTOMER", label: "SecureLink - Customer User Account", sortOrder: 7 },
        { value: "SECURELINK_TSI", label: "SecureLink - TSI User Account", sortOrder: 8 },
      ],
    },
    {
      fieldKey: "trainingType",
      fieldType: "dropdown",
      displayName: "Training",
      section: "resourceInfo",
      sortOrder: 2,
      options: [
        { value: "TECHNICIAN", label: "Technician", sortOrder: 0 },
        { value: "PROFESSIONAL_SERVICES", label: "Professional Services", sortOrder: 1 },
        { value: "SOLUTIONS_ARCHITECT", label: "Solutions Architect", sortOrder: 2 },
        { value: "OTHER", label: "Other", sortOrder: 3 },
      ],
    },
    {
      fieldKey: "postInstallPlan",
      fieldType: "dropdown",
      displayName: "Post Install Plan",
      section: "postInstall",
      sortOrder: 0,
      options: [
        { value: "FOCUS", label: "FOCUS", sortOrder: 0 },
        { value: "WARRANTY", label: "Warranty", sortOrder: 1 },
        { value: "TIME_AND_MATERIALS", label: "Time and Materials", sortOrder: 2 },
        { value: "NOT_APPLICABLE", label: "Not Applicable", sortOrder: 3 },
      ],
    },
    {
      fieldKey: "termsType",
      fieldType: "dropdown",
      displayName: "Terms",
      section: "proposal",
      sortOrder: 0,
      options: [
        { value: "CUSTOM_TERMS", label: "Custom Terms of Sale", sortOrder: 0 },
        { value: "EXISTING_MSA", label: "Existing MSA", sortOrder: 1 },
        { value: "STANDARD", label: "Standard Terms", sortOrder: 2 },
      ],
    },
  ];

  for (const field of fieldConfigs) {
    const { options, ...fieldData } = field;

    const existing = await prisma.fieldConfig.findUnique({
      where: { fieldKey: field.fieldKey },
    });

    if (!existing) {
      await prisma.fieldConfig.create({
        data: {
          ...fieldData,
          createdBy: DEFAULT_USER,
          updatedBy: DEFAULT_USER,
          options: {
            create: options.map((opt) => ({
              ...opt,
              isEnabled: true,
            })),
          },
        },
      });
    }
  }

  return { success: true };
}
