"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Code2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import SnippetCard, {
  Language,
  Snippet,
} from "@/components/shared/SnippetCard";
import { apiClient } from "@/lib/api/client";
import { fetchSnippetSearch } from "@/lib/api/snippetSearch";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useDeleteConfirmDialog } from "@/lib/hooks/useDeleteConfirmDialog";
import { cn } from "@/lib/utils";

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

async function fetchSnippets(): Promise<SnippetApiItem[]> {
  const json = await apiClient.get<SnippetsResponse>("/api/snippets", {
    timeoutMs: 12_000,
    retries: 2,
  });
  return json.data ?? [];
}

type DashboardSnippet = Snippet & { languageKey: string };

function buildLanguageFilterValue(language: string) {
  return `lang:${language}`;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [activeFilter, setFilter] = useState("all");
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const searchQuery = (searchParams.get("search") ?? "").trim();
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const isSearching = debouncedSearchQuery.length > 0;

  const {
    data: apiSnippets = [],
    isLoading: isListLoading,
    isError: isListError,
  } = useQuery({
    queryKey: ["snippets"],
    queryFn: fetchSnippets,
    enabled: !isSearching,
  });

  const {
    data: searchResults = [],
    isLoading: isSearchLoading,
    isError: isSearchError,
  } = useQuery({
    queryKey: ["snippet-search", debouncedSearchQuery, 50],
    queryFn: () => fetchSnippetSearch(debouncedSearchQuery, 50),
    enabled: isSearching,
  });

  const sourceSnippets = isSearching ? searchResults : apiSnippets;
  const isLoading = isSearching ? isSearchLoading : isListLoading;
  const isError = isSearching ? isSearchError : isListError;

  const snippets = useMemo<DashboardSnippet[]>(
    () =>
      sourceSnippets.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description ?? "",
        code: item.code,
        language: normalizeLanguage(item.language),
        languageKey: item.language.trim(),
        tags: item.tags ?? [],
        starred: item.isFavorite,
        addedAt: formatAddedAt(item.createdAt),
      })),
    [sourceSnippets],
  );

  const filters = useMemo(() => {
    const languageCounts = new Map<string, number>();
    for (const item of sourceSnippets) {
      const language = item.language.trim();
      if (!language) continue;
      languageCounts.set(language, (languageCounts.get(language) ?? 0) + 1);
    }

    const languageFilters = [...languageCounts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([language, count]) => ({
        label: count > 1 ? `${language} (${count})` : language,
        value: buildLanguageFilterValue(language),
      }));

    return [
      { label: "All", value: "all" },
      { label: "Starred", value: "starred" },
      ...languageFilters,
    ];
  }, [sourceSnippets]);

  const favoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      apiClient.patch(`/api/snippets/${id}/favorite`, { isFavorite }),
    onMutate: async ({ id, isFavorite }) => {
      queryClient.setQueryData<SnippetApiItem[]>(["snippets"], (prev = []) =>
        prev.map((snippet) =>
          snippet.id === id ? { ...snippet, isFavorite } : snippet,
        ),
      );
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["snippets"] }),
        queryClient.invalidateQueries({ queryKey: ["snippet-search"] }),
        queryClient.invalidateQueries({ queryKey: ["collection-snippets"] }),
      ]);
    },
  });

  const handleStar = (id: string) => {
    const current = snippets.find((s) => s.id === id)?.starred ?? false;
    favoriteMutation.mutate({ id, isFavorite: !current });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/snippets/${id}`),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["snippets"] }),
        queryClient.invalidateQueries({ queryKey: ["snippet-search"] }),
        queryClient.invalidateQueries({ queryKey: ["collection-snippets"] }),
        queryClient.invalidateQueries({ queryKey: ["collections"] }),
      ]);
      closeDeleteDialog();
    },
  });

  const { requestDelete, closeDeleteDialog, dialog } = useDeleteConfirmDialog(
    deleteMutation.isPending,
  );

  const handleDelete = (id: string) => {
    const snippet = snippets.find((s) => s.id === id);
    if (!snippet) return;

    requestDelete({
      title: "Delete snippet?",
      description: `"${snippet.title}" will be permanently removed. This action cannot be undone.`,
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  useEffect(() => {
    if (activeFilter === "all" || activeFilter === "starred") return;
    if (!filters.some((f) => f.value === activeFilter)) {
      setFilter("all");
    }
  }, [activeFilter, filters]);

  const filtered = snippets.filter((s) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "starred") return s.starred;
    if (activeFilter.startsWith("lang:")) {
      return s.languageKey === activeFilter.slice("lang:".length);
    }
    return true;
  });

  return (
    <div className="flex-1 bg-surface-base p-6">
      {/* ── Page header ──────────────────────── */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-ink-primary font-mono tracking-tight">
            All Snippets
          </h1>
          <p className="text-[12px] text-[#555555] font-mono mt-1">
            {filtered.length} of {snippets.length} items
            {searchQuery ? ` matching "${searchQuery}"` : ""}
            {" "} &middot; Sorted by recently added
          </p>
        </div>
      </div>

      {/* ── Filter tabs ──────────────────────── */}
      <div className="flex items-center gap-1.5 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1 rounded-md text-[11px] font-mono tracking-[0.03em] border transition-colors duration-150",
              activeFilter === f.value
                ? "bg-purple-950 border-[#3d2f6e] text-purple-300"
                : "bg-transparent border-border-base text-[#555555] hover:border-border-hover hover:text-[#888888]",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Snippet grid ─────────────────────── */}
      {isLoading ? (
        <div className="py-24 text-center text-[13px] text-[#666] font-mono">
          Loading snippets...
        </div>
      ) : isError ? (
        <div className="py-24 text-center text-[13px] text-red-400 font-mono">
          Failed to load snippets.
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-xl bg-purple-950 border border-[#3d2f6e] flex items-center justify-center mb-4">
            <Code2 size={20} className="text-purple-600" />
          </div>
          <p className="text-[14px] text-[#555555] font-mono">
            No snippets found
          </p>
          <p className="text-[12px] text-ink-disabled font-mono mt-1">
            Try a different filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((snippet) => (
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
      {dialog}
    </div>
  );
}
