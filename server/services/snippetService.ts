import { CreateSnippetInput } from "@/lib/validators/snippet";
import { getCollectionForUserService } from "@/server/services/collectionService";
import {
  createSnippet,
  listSnippets,
  searchSnippetsBasic,
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
  return searchSnippetsBasic(userId, query, limit);
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
