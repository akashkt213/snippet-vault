import { prisma } from "@/lib/db/prisma";
import { CreateSnippetInput } from "@/lib/validators/snippet";
import { SearchSnippetResult } from "@/server/types";

export async function createSnippet(input: CreateSnippetInput, userId: string) {
  return prisma.snippet.create({
    data: {
      title: input.title,
      description: input.description,
      code: input.code,
      language: input.language,
      tags: input.tags,
      isFavorite: input.isFavorite,
      collectionId: input.collectionId,
      userId,
    },
  });
}

export async function updateSnippetFavorite(
  snippetId: string,
  userId: string,
  isFavorite: boolean,
) {
  return prisma.snippet.update({
    where: { id: snippetId, userId },
    data: { isFavorite },
  });
}

export async function findSnippetForUser(snippetId: string, userId: string) {
  return prisma.snippet.findFirst({
    where: { id: snippetId, userId },
    include: { collection: true },
  });
}

export async function updateSnippet(
  snippetId: string,
  userId: string,
  input: {
    title?: string;
    description?: string;
    code?: string;
    language?: string;
    tags?: string[];
    collectionId?: string;
  },
) {
  return prisma.snippet.update({
    where: { id: snippetId, userId },
    data: input,
    include: { collection: true },
  });
}

export async function deleteSnippet(snippetId: string, userId: string) {
  return prisma.snippet.delete({
    where: { id: snippetId, userId },
  });
}

export async function listSnippets(userId: string, collectionId?: string) {
  return prisma.snippet.findMany({
    where: {
      userId,
      ...(collectionId ? { collectionId } : {}),
    },
    include: {
      collection: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function searchSnippetsBasic(
  userId: string,
  query: string,
  limit = 10,
): Promise<SearchSnippetResult[]> {
  return prisma.snippet.findMany({
    where: {
      userId,
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
