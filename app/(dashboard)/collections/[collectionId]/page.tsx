"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Code2 } from "lucide-react";

import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import SnippetCard, {
  Language,
  Snippet,
} from "@/components/shared/SnippetCard";

type CollectionApiItem = {
  id: string;
  name: string;
  description: string | null;
  snippetCount: number;
};

type CollectionsResponse = {
  data: CollectionApiItem[];
};

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

export default function CollectionDetailsPage() {
  const params = useParams<{ collectionId: string }>();
  const collectionId = params.collectionId;
  const queryClient = useQueryClient();

  const { data: collectionsResponse } = useQuery({
    queryKey: ["collections"],
    queryFn: () => apiClient.get<CollectionsResponse>("/api/collections"),
  });

  const { data: snippetsResponse, isLoading, isError } = useQuery({
    queryKey: ["collection-snippets", collectionId],
    queryFn: () =>
      apiClient.get<SnippetsResponse>(
        `/api/snippets?collectionId=${encodeURIComponent(collectionId)}`,
      ),
    enabled: Boolean(collectionId),
  });

  const collection = collectionsResponse?.data.find((c) => c.id === collectionId);
  const snippets = useMemo<Snippet[]>(
    () =>
      (snippetsResponse?.data ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description ?? "",
        code: item.code,
        language: normalizeLanguage(item.language),
        tags: item.tags ?? [],
        starred: item.isFavorite,
        addedAt: formatAddedAt(item.createdAt),
      })),
    [snippetsResponse?.data],
  );

  const favoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      apiClient.patch(`/api/snippets/${id}/favorite`, { isFavorite }),
    onMutate: ({ id, isFavorite }) => {
      queryClient.setQueryData<SnippetsResponse>(
        ["collection-snippets", collectionId],
        (prev) =>
          prev
            ? {
                ...prev,
                data: prev.data.map((snippet) =>
                  snippet.id === id ? { ...snippet, isFavorite } : snippet,
                ),
              }
            : prev,
      );
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["collection-snippets", collectionId],
        }),
        queryClient.invalidateQueries({ queryKey: ["snippets"] }),
      ]);
    },
  });

  const handleStar = (id: string) => {
    const current = snippets.find((s) => s.id === id)?.starred ?? false;
    favoriteMutation.mutate({ id, isFavorite: !current });
  };

  return (
    <div className="flex-1 bg-surface-base p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-ink-muted">WORKSPACE / COLLECTIONS</p>
          <h1 className="mt-1 text-lg font-semibold text-ink-primary">
            {collection?.name ?? "Collection"}
          </h1>
          <p className="mt-1 text-xs text-ink-secondary">
            {collection?.description || "Snippets in this collection"}
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/collections">
            <ArrowLeft size={14} />
            Back
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-sm text-ink-muted">
          Loading snippets...
        </div>
      ) : isError ? (
        <div className="py-10 text-center text-sm text-red-400">
          Failed to load snippets for this collection.
        </div>
      ) : snippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#3d2f6e] bg-purple-950">
            <Code2 size={20} className="text-purple-600" />
          </div>
          <p className="text-[14px] font-mono text-[#555555]">No snippets found</p>
          <p className="mt-1 font-mono text-[12px] text-ink-disabled">
            This collection has no snippets yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {snippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onStar={handleStar}
              onClick={(id) => console.log("open snippet", id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
