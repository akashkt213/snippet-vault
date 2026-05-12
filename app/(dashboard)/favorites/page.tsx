"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SnippetCard, {
  Language,
  Snippet,
} from "@/components/shared/SnippetCard";
import { apiClient } from "@/lib/api/client";

type SnippetApiItem = {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
};

type SnippetsResponse = {
  data: SnippetApiItem[];
};

const SUPPORTED_LANGUAGES: Set<Language> = new Set([
  "REACT",
  "JS",
  "TS",
  "JAVA",
  "PY",
  "CSS",
  "YAML",
  "RUST",
  "SQL",
  "BASH",
  "GO",
]);

function normalizeLanguage(language: string): Language {
  const upper = language.toUpperCase();
  return SUPPORTED_LANGUAGES.has(upper as Language) ? (upper as Language) : "JS";
}

function formatAddedAt(dateStr: string): string {
  const createdAt = new Date(dateStr).getTime();
  if (Number.isNaN(createdAt)) return "now";

  const diffMs = Date.now() - createdAt;
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function FavoritesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: apiSnippets = [], isLoading, isError } = useQuery({
    queryKey: ["snippets"],
    queryFn: () =>
      apiClient
        .get<SnippetsResponse>("/api/snippets", {
          timeoutMs: 12_000,
          retries: 2,
        })
        .then((json) => json.data ?? []),
  });

  const favorites = useMemo<Snippet[]>(
    () =>
      apiSnippets
        .filter((item) => item.isFavorite)
        .map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description ?? "",
          code: item.code,
          language: normalizeLanguage(item.language),
          tags: item.tags ?? [],
          starred: true,
          addedAt: formatAddedAt(item.createdAt),
        })),
    [apiSnippets],
  );

  const favoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      apiClient.patch(`/api/snippets/${id}/favorite`, { isFavorite }),
    onMutate: ({ id, isFavorite }) => {
      queryClient.setQueryData<SnippetApiItem[]>(["snippets"], (prev = []) =>
        prev.map((snippet) =>
          snippet.id === id ? { ...snippet, isFavorite } : snippet,
        ),
      );
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["snippets"] }),
        queryClient.invalidateQueries({ queryKey: ["collection-snippets"] }),
      ]);
    },
  });

  const handleStar = (id: string) => {
    favoriteMutation.mutate({ id, isFavorite: false });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/snippets/${id}`),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["snippets"] }),
        queryClient.invalidateQueries({ queryKey: ["collection-snippets"] }),
        queryClient.invalidateQueries({ queryKey: ["collections"] }),
      ]);
    },
  });

  const handleDelete = (id: string) => {
    const snippet = favorites.find((s) => s.id === id);
    if (!snippet) return;

    const confirmed = window.confirm(
      `Delete "${snippet.title}"? This action cannot be undone.`,
    );
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex-1 bg-surface-base p-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs text-ink-muted">
          WORKSPACE / FAVORITES
        </p>
        <h1 className="text-lg font-semibold mt-1">Starred Snippets</h1>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-sm text-ink-muted">
          Loading favorites...
        </div>
      ) : isError ? (
        <div className="py-10 text-center text-sm text-red-400">
          Failed to load favorites.
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center text-sm text-ink-muted">
          No starred snippets yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {favorites.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onStar={handleStar}
              onClick={(id) => router.push(`/snippets/${id}`)}
              onEdit={(id) => router.push(`/snippets/${id}/edit`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
