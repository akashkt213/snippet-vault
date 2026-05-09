"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Plus,
  Search,
  Code2,
  FolderOpen,
  Star,
  ChevronUp,
  ChevronDown,
  CornerDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";

// ── Types ─────────────────────────────────────────────────────────────────────
type SnippetApiItem = {
  id: string;
  title: string;
  description: string | null;
  language: string;
  tags: string[];
  createdAt: string;
};

type SnippetsResponse = {
  data: SnippetApiItem[];
};

type PaletteSnippet = {
  id: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
  lastEdited: string;
};

function formatLastEdited(dateStr: string): string {
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

// ── Fuzzy ─────────────────────────────────────────────────────────────────────
function fuzzyScore(str: string, q: string) {
  const source = str.toLowerCase();
  const query = q.toLowerCase().trim();
  if (!query) return 0;

  const exactIndex = source.indexOf(query);
  if (exactIndex !== -1) {
    const startBonus = exactIndex === 0 ? 60 : 0;
    return 200 + startBonus - exactIndex;
  }

  let score = 0;
  let streak = 0;
  let gapPenalty = 0;

  // Ordered subsequence matcher with bonus for contiguous chars.
  // This makes "ftr" match "fetch with retry" while ranking tighter matches higher.
  let foundAny = false;
  let si = 0;
  for (let qi = 0; qi < query.length; qi++) {
    while (si < source.length && source[si] !== query[qi]) {
      si++;
      gapPenalty += 1;
      streak = 0;
    }
    if (si >= source.length) return null;
    foundAny = true;
    streak += 1;
    score += 12 + streak * 4;
    si++;
  }

  if (!foundAny) return null;
  return Math.max(1, score - gapPenalty);
}

// ── Shared classnames ─────────────────────────────────────────────────────────
const baseItem =
  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-100 focus:outline-none data-[selected=true]:bg-[#252535] hover:bg-[#252535]";

const groupHeading =
  "[&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-[0.1em] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-[#44445a] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-mono";

// ── Props ─────────────────────────────────────────────────────────────────────
interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandPalette({
  open,
  onOpenChange,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { data: apiSnippets = [], isLoading } = useQuery({
    queryKey: ["snippets"],
    queryFn: () =>
      apiClient
        .get<SnippetsResponse>("/api/snippets", {
          timeoutMs: 12_000,
          retries: 1,
        })
        .then((json) => json.data ?? [])
        .catch(() => []),
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setQuery("");
    onOpenChange(nextOpen);
  };

  const navigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const allSnippets = useMemo<PaletteSnippet[]>(
    () =>
      apiSnippets.map((snippet) => ({
        id: snippet.id,
        title: snippet.title,
        description: snippet.description ?? "",
        language: snippet.language,
        tags: snippet.tags ?? [],
        lastEdited: formatLastEdited(snippet.createdAt),
      })),
    [apiSnippets],
  );

  const matchedSnippets = useMemo(() => {
    if (!query.trim()) {
      return allSnippets.slice(0, 6);
    }

    return allSnippets
      .map((snippet) => {
        const titleScore = fuzzyScore(snippet.title, query) ?? 0;
        const languageScore = fuzzyScore(snippet.language, query) ?? 0;
        const descriptionScore = fuzzyScore(snippet.description, query) ?? 0;
        const tagScore = Math.max(
          0,
          ...snippet.tags.map((tag) => fuzzyScore(tag, query) ?? 0),
        );
        const totalScore =
          titleScore * 4 + tagScore * 3 + languageScore * 2 + descriptionScore;
        return { snippet, totalScore };
      })
      .filter((item) => item.totalScore > 0)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10)
      .map((item) => item.snippet);
  }, [allSnippets, query]);

  const collectionHint = query
    ? `Collections / ${query.charAt(0).toUpperCase() + query.slice(1)}`
    : "Collections / New";

  const capitalised = query
    ? query.charAt(0).toUpperCase() + query.slice(1) + " "
    : "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/*
        Key fix: override every default DialogContent style.
        bg-transparent  → removes the white background
        border-none     → removes the default border
        shadow-none     → removes the default shadow
        p-0             → removes default padding
        max-w-none      → lets our inner Command define its own width
        top-[20%]       → position palette near the top, not dead center
      */}
      <DialogContent
        className={cn(
          "bg-transparent border-none shadow-none p-0",
          "max-w-none w-auto top-[20%] translate-y-0",
          // Hide the default (X) close button that shadcn adds
          "[&>button:last-child]:hidden",
        )}
      >
        {/*
          Command must be the direct parent of CommandInput,
          CommandList etc. — this is what fixes the context error.
          All our visual styling goes on this div.
        */}
        <Command
          shouldFilter={false}
          className="flex flex-col w-140 bg-[#1c1c24] border border-[#2a2a3a] rounded-xl overflow-hidden shadow-2xl shadow-black/70"
        >
          {/* ── Input row ──────────────────────── */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#25252f]">
            <Search size={15} className="text-[#666680] shrink-0" />

            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search snippets, collections, or run a command..."
              className="flex-1 h-auto p-0 bg-transparent border-none shadow-none outline-none ring-0 focus:ring-0 focus-visible:ring-0 text-[13px] font-mono text-[#ccccdd] placeholder:text-[#44445a]"
            />

            <kbd className="shrink-0 px-2 py-0.5 rounded text-[10px] font-mono text-[#44445a] bg-[#252530] border border-[#2a2a3a]">
              ESC
            </kbd>
          </div>

          {/* ── List ───────────────────────────── */}
          <CommandList className="max-h-90 overflow-y-auto py-2 px-2">
            <CommandEmpty className="py-8 text-center text-[12px] font-mono text-[#44445a]">
              No results found for &quot;{query}&quot;
            </CommandEmpty>

            {/* Suggested Actions */}
            <CommandGroup heading="Suggested Actions" className={groupHeading}>
              <CommandItem
                value={`create-new-${query}-snippet`}
                onSelect={() => {
                  setQuery("");
                  navigate(
                    `/newsnippet${query ? `?title=${encodeURIComponent(query)}` : ""}`,
                  );
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer focus:outline-none",
                  "border border-transparent transition-colors duration-100",
                  "data-[selected=true]:bg-purple-950 data-[selected=true]:border-[#3d2f6e]",
                  "hover:bg-purple-950 hover:border-[#3d2f6e]",
                )}
              >
                <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-md bg-[#252535] border border-[#2a2a3a]">
                  <Plus size={14} className="text-purple-400" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium font-mono text-[#e5e5f0]">
                    Create New {capitalised}Snippet
                  </span>
                  <span className="text-[11px] font-mono text-[#55556a]">
                    in {collectionHint}
                  </span>
                </div>
              </CommandItem>

              {query && (
                <CommandItem
                  value={`search-globally-${query}`}
                  onSelect={() =>
                    navigate(`/dashboard?search=${encodeURIComponent(query)}`)
                  }
                  className={baseItem}
                >
                  <Search size={14} className="text-[#55556a] ml-1 shrink-0" />
                  <span className="text-[12px] font-mono text-[#888899]">
                    Search globally for &quot;
                    <span className="text-[#ccccdd]">{query}</span>
                    &quot;
                  </span>
                </CommandItem>
              )}
            </CommandGroup>

            <CommandSeparator className="my-1.5 mx-2 bg-[#25252f]" />

            {/* Recent / Matching Snippets */}
            <CommandGroup
              heading={
                query
                  ? `Recent Snippets Matching "${query}"`
                  : "Recent Snippets"
              }
              className={groupHeading}
            >
              {matchedSnippets.length === 0 ? (
                isLoading ? (
                  <p className="px-3 py-2 text-[11px] font-mono text-[#44445a]">
                    Loading your snippets...
                  </p>
                ) : (
                  <p className="px-3 py-2 text-[11px] font-mono text-[#44445a]">
                    No snippets match &quot;{query}&quot;
                  </p>
                )
              ) : (
                matchedSnippets.map((snippet) => (
                  <CommandItem
                    key={snippet.id}
                    value={`${snippet.id}-${snippet.title}`}
                    onSelect={() => navigate(`/dashboard`)}
                    className={baseItem}
                  >
                    <Code2
                      size={14}
                      className="text-[#55556a] shrink-0 ml-0.5"
                    />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[13px] font-medium font-mono text-[#e5e5f0] truncate">
                        {snippet.title}
                      </span>
                      <span className="text-[11px] font-mono text-[#55556a]">
                        Language: {snippet.language}
                        <span className="mx-1.5 text-[#33333f]">•</span>
                        Last edited {snippet.lastEdited}
                      </span>
                    </div>
                  </CommandItem>
                ))
              )}
            </CommandGroup>

            <CommandSeparator className="my-1.5 mx-2 bg-[#25252f]" />

            {/* Navigation */}
            <CommandGroup heading="Navigation" className={groupHeading}>
              <CommandItem
                value="go-to-collections"
                onSelect={() => navigate("/collections")}
                className={baseItem}
              >
                <FolderOpen
                  size={14}
                  className="text-[#55556a] shrink-0 ml-0.5"
                />
                <span className="text-[13px] font-mono text-[#aaaabc]">
                  Go to Collections
                </span>
              </CommandItem>

              <CommandItem
                value="go-to-favorites"
                onSelect={() => navigate("/favorites")}
                className={baseItem}
              >
                <Star size={14} className="text-[#55556a] shrink-0 ml-0.5" />
                <span className="text-[13px] font-mono text-[#aaaabc]">
                  Go to Favorites
                </span>
              </CommandItem>
            </CommandGroup>
          </CommandList>

          {/* ── Footer ─────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#18181f] border-t border-[#25252f]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-[10px] font-mono text-[#44445a]">
                <ChevronUp size={10} className="text-[#33333f]" />
                <ChevronDown size={10} className="text-[#33333f]" />
                to navigate
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-[#44445a]">
                <CornerDownLeft size={10} className="text-[#33333f]" />
                to select
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#33333f]">
              SnippetVault Command v2.1
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
