import { z } from "zod/v4";

export const createProjectLocationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
});

export const updateProjectLocationSchema = z.object({
  name: z.string().min(1, "Location name is required").optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type CreateProjectLocationInput = z.infer<typeof createProjectLocationSchema>;
export type UpdateProjectLocationInput = z.infer<typeof updateProjectLocationSchema>;
