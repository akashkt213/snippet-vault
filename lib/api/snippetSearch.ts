import { apiClient } from "@/lib/api/client";

export type SearchSnippetApiItem = {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[];
  isFavorite: boolean;
  collectionId: string;
  createdAt: string;
  updatedAt: string;
};

type SearchResponse = {
  data: SearchSnippetApiItem[];
  meta: {
    q: string;
    limit: number;
    count: number;
  };
};

export function buildSnippetSearchUrl(query: string, limit = 10) {
  const params = new URLSearchParams();
  if (query.trim()) {
    params.set("q", query.trim());
  }
  params.set("limit", String(limit));
  return `/api/search?${params.toString()}`;
}

export async function fetchSnippetSearch(
  query: string,
  limit = 10,
): Promise<SearchSnippetApiItem[]> {
  const json = await apiClient.get<SearchResponse>(
    buildSnippetSearchUrl(query, limit),
    {
      timeoutMs: 12_000,
      retries: 1,
    },
  );

  return json.data ?? [];
}
