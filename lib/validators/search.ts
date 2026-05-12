import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().trim().max(200).default(""),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
