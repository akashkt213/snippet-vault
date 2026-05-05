import { z } from "zod";

export const createSnippetSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  code: z.string().min(1),
  language: z.string().trim().min(1).max(30),
  tags: z.array(z.string().trim().min(1).max(30)).max(20).default([]),
  isFavorite: z.boolean().default(false),
  collectionId: z.string().min(1),
});

export type CreateSnippetInput = z.infer<typeof createSnippetSchema>;
