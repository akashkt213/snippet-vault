import { CreateSnippetInput } from "@/lib/validators/snippet";
import {
  createSnippet,
  listSnippets,
  searchSnippetsBasic,
  updateSnippetFavorite,
} from "@/server/repos/snippetRepo";

export async function createSnippetService(input: CreateSnippetInput) {
  return createSnippet(input);
}

export async function listSnippetsService(collectionId?: string) {
  return listSnippets(collectionId);
}

export async function searchSnippetsService(query: string, limit = 10) {
  return searchSnippetsBasic(query, limit);
}

export async function updateSnippetFavoriteService(
  snippetId: string,
  isFavorite: boolean,
) {
  return updateSnippetFavorite(snippetId, isFavorite);
}
