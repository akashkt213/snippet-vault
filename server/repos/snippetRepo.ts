import { prisma } from "@/lib/db/prisma";
import { CreateSnippetInput } from "@/lib/validators/snippet";
import { SearchSnippetResult } from "@/server/types";

export async function createSnippet(input: CreateSnippetInput) {
  return prisma.snippet.create({
    data: {
      title: input.title,
      description: input.description,
      code: input.code,
      language: input.language,
      tags: input.tags,
      isFavorite: input.isFavorite,
      collectionId: input.collectionId,
    },
  });
}

export async function updateSnippetFavorite(snippetId: string, isFavorite: boolean) {
  return prisma.snippet.update({
    where: { id: snippetId },
    data: { isFavorite },
  });
}

export async function listSnippets(collectionId?: string) {
  return prisma.snippet.findMany({
    where: collectionId
      ? {
          collectionId,
        }
      : undefined,
    include: {
      collection: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function searchSnippetsBasic(query: string, limit = 10): Promise<SearchSnippetResult[]> {
  // Temporary fallback before pg_trgm SQL ranking is added.
  return prisma.snippet.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { language: { contains: query, mode: "insensitive" } },
        { code: { contains: query, mode: "insensitive" } },
        { tags: { hasSome: [query] } },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      language: true,
      tags: true,
      collectionId: true,
    },
    take: limit,
    orderBy: { updatedAt: "desc" },
  });
}
