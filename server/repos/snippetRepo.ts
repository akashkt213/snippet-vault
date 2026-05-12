import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { CreateSnippetInput } from "@/lib/validators/snippet";
import { SearchSnippetResult } from "@/server/types";

const searchSnippetSelect = {
  id: true,
  title: true,
  description: true,
  code: true,
  language: true,
  tags: true,
  isFavorite: true,
  collectionId: true,
  createdAt: true,
  updatedAt: true,
} as const;

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

export async function searchSnippets(
  userId: string,
  query: string,
  limit = 10,
): Promise<SearchSnippetResult[]> {
  const trimmed = query.trim();

  if (!trimmed) {
    return prisma.snippet.findMany({
      where: { userId },
      select: searchSnippetSelect,
      orderBy: { updatedAt: "desc" },
      take: limit,
    });
  }

  return prisma.$queryRaw<SearchSnippetResult[]>(Prisma.sql`
    SELECT
      s.id,
      s.title,
      s.description,
      s.code,
      s.language,
      s.tags,
      s."isFavorite",
      s."collectionId",
      s."createdAt",
      s."updatedAt"
    FROM "Snippet" s
    WHERE s."userId" = ${userId}
      AND (
        s.title ILIKE '%' || ${trimmed} || '%'
        OR COALESCE(s.description, '') ILIKE '%' || ${trimmed} || '%'
        OR s.language ILIKE '%' || ${trimmed} || '%'
        OR s.code ILIKE '%' || ${trimmed} || '%'
        OR "immutable_array_to_string"(s.tags, ' ') ILIKE '%' || ${trimmed} || '%'
        OR s.title % ${trimmed}
        OR COALESCE(s.description, '') % ${trimmed}
        OR s.language % ${trimmed}
        OR s.code % ${trimmed}
        OR "immutable_array_to_string"(s.tags, ' ') % ${trimmed}
      )
    ORDER BY
      CASE
        WHEN s.title ILIKE ${trimmed} || '%' THEN 4
        WHEN s.title ILIKE '%' || ${trimmed} || '%' THEN 3
        WHEN COALESCE(s.description, '') ILIKE '%' || ${trimmed} || '%' THEN 2
        ELSE 1
      END DESC,
      GREATEST(
        similarity(s.title, ${trimmed}),
        similarity(COALESCE(s.description, ''), ${trimmed}),
        similarity(s.language, ${trimmed}),
        similarity(s.code, ${trimmed}),
        similarity("immutable_array_to_string"(s.tags, ' '), ${trimmed})
      ) DESC,
      s."updatedAt" DESC
    LIMIT ${limit}
  `);
}
