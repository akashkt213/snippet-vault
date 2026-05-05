import { CreateSnippetInput } from "@/lib/validators/snippet";
import { createSnippet, listSnippets, searchSnippetsBasic } from "@/server/repos/snippetRepo";

export async function createSnippetService(input: CreateSnippetInput) {
  return createSnippet(input);
}

export async function listSnippetsService() {
  return listSnippets();
}

export async function searchSnippetsService(query: string, limit = 10) {
  return searchSnippetsBasic(query, limit);
}
