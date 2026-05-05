import { z } from "zod";

export const createCollectionSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(300).optional(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
