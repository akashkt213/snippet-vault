import { CreateSnippetInput, UpdateSnippetInput } from "@/lib/validators/snippet";
import { getCollectionForUserService } from "@/server/services/collectionService";
import {
  createSnippet,
  deleteSnippet,
  findSnippetForUser,
  listSnippets,
  searchSnippets,
  updateSnippet,
  updateSnippetFavorite,
} from "@/server/repos/snippetRepo";

export async function createSnippetService(input: CreateSnippetInput, userId: string) {
  const collection = await getCollectionForUserService(input.collectionId, userId);

  if (!collection) {
    return { error: "COLLECTION_NOT_FOUND" as const };
  }

  const snippet = await createSnippet(input, userId);
  return { snippet };
}

export async function listSnippetsService(userId: string, collectionId?: string) {
  return listSnippets(userId, collectionId);
}

export async function searchSnippetsService(userId: string, query: string, limit = 10) {
  return searchSnippets(userId, query, limit);
}

export async function updateSnippetFavoriteService(
  snippetId: string,
  userId: string,
  isFavorite: boolean,
) {
  try {
    const snippet = await updateSnippetFavorite(snippetId, userId, isFavorite);
    return { snippet };
  } catch {
    return { error: "SNIPPET_NOT_FOUND" as const };
  }
}

export async function getSnippetService(snippetId: string, userId: string) {
  const snippet = await findSnippetForUser(snippetId, userId);

  if (!snippet) {
    return { error: "SNIPPET_NOT_FOUND" as const };
  }

  return { snippet };
}

export async function updateSnippetService(
  snippetId: string,
  userId: string,
  input: UpdateSnippetInput,
) {
  if (input.collectionId) {
    const collection = await getCollectionForUserService(input.collectionId, userId);

    if (!collection) {
      return { error: "COLLECTION_NOT_FOUND" as const };
    }
  }

  try {
    const snippet = await updateSnippet(snippetId, userId, input);
    return { snippet };
  } catch {
    return { error: "SNIPPET_NOT_FOUND" as const };
  }
}

export async function deleteSnippetService(snippetId: string, userId: string) {
  try {
    const snippet = await deleteSnippet(snippetId, userId);
    return { snippet };
  } catch {
    return { error: "SNIPPET_NOT_FOUND" as const };
  }
}
