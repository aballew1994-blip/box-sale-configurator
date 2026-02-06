import { z } from "zod/v4";

export const submitConfigurationSchema = z.object({
  idempotencyKey: z.string().min(1, "Idempotency key is required").optional(),
});

export type SubmitConfigurationInput = z.infer<typeof submitConfigurationSchema>;
