"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, Code2 } from "lucide-react";
import SnippetCard, {
  Language,
  Snippet,
} from "@/components/shared/SnippetCard";
import { apiClient } from "@/lib/api/client";
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

// ── Filter tabs ───────────────────────────────────────────────────────────────
const FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Starred", value: "starred" },
  { label: "React", value: "REACT" },
  { label: "JS / TS", value: "JS" },
  { label: "Java", value: "JAVA" },
  { label: "DevOps", value: "YAML" },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeFilter, setFilter] = useState("all");
  const [starredOverrides, setStarredOverrides] = useState<Record<string, boolean>>({});

  const {
    data: apiSnippets = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["snippets"],
    queryFn: fetchSnippets,
  });

  const snippets = useMemo<Snippet[]>(
    () =>
      apiSnippets.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description ?? "",
        code: item.code,
        language: normalizeLanguage(item.language),
        tags: item.tags ?? [],
        starred: starredOverrides[item.id] ?? item.isFavorite,
        addedAt: formatAddedAt(item.createdAt),
      })),
    [apiSnippets, starredOverrides],
  );

  const handleStar = (id: string) => {
    setStarredOverrides((prev) => {
      const current = prev[id] ?? snippets.find((s) => s.id === id)?.starred ?? false;
      return { ...prev, [id]: !current };
    });
  };

  const filtered = snippets.filter((s) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "starred") return s.starred;
    if (activeFilter === "JS")
      return s.language === "JS" || s.language === "TS";
    return s.language === activeFilter;
  });

  return (
    <div className="p-6 max-w-350">
      {/* ── Page header ──────────────────────── */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-ink-primary font-mono tracking-tight">
            All Snippets
          </h1>
          <p className="text-[12px] text-[#555555] font-mono mt-1">
            {snippets.length} total items &middot; Sorted by recently added
          </p>
        </div>

        {/* Filter button */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-default border border-border-base text-ink-muted text-[11px] font-mono hover:border-[#3d2f6e] hover:text-purple-300 transition-colors duration-150">
          <Filter size={12} />
          FILTER
        </button>
      </div>

      {/* ── Filter tabs ──────────────────────── */}
      <div className="flex items-center gap-1.5 mb-6 flex-wrap">
        {FILTERS.map((f) => (
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
              onClick={(id) => console.log("open snippet", id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
