import { z } from "zod/v4";

// Table filter schemas
export const tableFilterSchema = z.object({
  itemTypes: z.array(z.enum(["inventoryItem", "nonInventoryItem", "serviceItem"])).optional(),
  nameContains: z.array(z.string()).optional(),
  nameExcludes: z.array(z.string()).optional(),
  manufacturers: z.array(z.string()).optional(),
  costMin: z.number().nullable().optional(),
  costMax: z.number().nullable().optional(),
});

export type TableFilters = z.infer<typeof tableFilterSchema>;

export const updateTableFilterConfigSchema = z.object({
  displayName: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  isEnabled: z.boolean().optional(),
  filters: tableFilterSchema.optional(),
});

export type UpdateTableFilterConfigInput = z.infer<typeof updateTableFilterConfigSchema>;

// Field config schemas
export const createFieldConfigSchema = z.object({
  fieldKey: z.string().min(1, "Field key is required"),
  fieldType: z.enum(["dropdown", "yesno", "text", "textarea"]),
  displayName: z.string().min(1, "Display name is required"),
  description: z.string().nullable().optional(),
  section: z.string().min(1, "Section is required"),
  sortOrder: z.number().int().optional(),
  isEnabled: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  netsuiteField: z.string().nullable().optional(),
  showWhen: z.object({
    field: z.string(),
    equals: z.array(z.string()),
  }).nullable().optional(),
});

export type CreateFieldConfigInput = z.infer<typeof createFieldConfigSchema>;

export const updateFieldConfigSchema = z.object({
  displayName: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  section: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
  isEnabled: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  netsuiteField: z.string().nullable().optional(),
  showWhen: z.object({
    field: z.string(),
    equals: z.array(z.string()),
  }).nullable().optional(),
});

export type UpdateFieldConfigInput = z.infer<typeof updateFieldConfigSchema>;

// Option schemas
export const createOptionSchema = z.object({
  value: z.string().min(1, "Option value is required"),
  label: z.string().min(1, "Option label is required"),
  sortOrder: z.number().int().optional(),
  isEnabled: z.boolean().optional(),
  netsuiteValue: z.string().nullable().optional(),
});

export type CreateOptionInput = z.infer<typeof createOptionSchema>;

export const updateOptionSchema = z.object({
  label: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
  isEnabled: z.boolean().optional(),
  netsuiteValue: z.string().nullable().optional(),
});

export type UpdateOptionInput = z.infer<typeof updateOptionSchema>;

export const reorderOptionsSchema = z.object({
  optionIds: z.array(z.string().min(1)),
});

export type ReorderOptionsInput = z.infer<typeof reorderOptionsSchema>;
