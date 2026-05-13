"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import { fetchSnippetSearch } from "@/lib/api/snippetSearch";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── Shared classnames (semantic tokens → correct in html.light / html.dark) ─
const baseItem =
  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-100 focus:outline-none data-[selected=true]:bg-surface-hover hover:bg-surface-hover";

const groupHeading =
  "[&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-[0.1em] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-ink-muted [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-mono";

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
  const debouncedQuery = useDebouncedValue(query, 250);
  const searchLimit = query.trim() ? 10 : 6;
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["snippet-search", debouncedQuery, searchLimit],
    queryFn: () => fetchSnippetSearch(debouncedQuery, searchLimit),
    enabled: open,
    staleTime: 30_000,
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setQuery("");
    onOpenChange(nextOpen);
  };

  const navigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const matchedSnippets = useMemo<PaletteSnippet[]>(
    () =>
      searchResults.map((snippet) => ({
        id: snippet.id,
        title: snippet.title,
        description: snippet.description ?? "",
        language: snippet.language,
        tags: snippet.tags ?? [],
        lastEdited: formatLastEdited(snippet.updatedAt),
      })),
    [searchResults],
  );

  const collectionHint = query
    ? `Collections / ${query.charAt(0).toUpperCase() + query.slice(1)}`
    : "Collections / New";

  const capitalised = query
    ? query.charAt(0).toUpperCase() + query.slice(1) + " "
    : "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "bg-transparent border-none shadow-none p-0",
          "max-w-none w-auto top-[20%] translate-y-0",
          // Hide the default (X) close button that shadcn adds
          "[&>button:last-child]:hidden",
        )}
      >
        <DialogTitle className="sr-only">
          Search snippets, collections, and commands
        </DialogTitle>
        <Command
          shouldFilter={false}
          className="flex flex-col w-140 bg-surface-raised border border-border-base rounded-xl overflow-hidden shadow-2xl ring-1 ring-border-subtle shadow-black/15 dark:shadow-black/50"
        >
          {/* ── Input row ──────────────────────── */}
          <div className="flex items-center gap-3 px-4 py-3 border-b rounded-xl border-border-subtle bg-surface-shell">
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search snippets, collections, or run a command..."
              className="flex-1 h-auto p-0 bg-transparent border-none shadow-none outline-none ring-0 focus:ring-0 focus-visible:ring-0 text-[13px] font-mono text-ink-primary placeholder:text-ink-muted"
            />

            <kbd className="shrink-0 px-2 py-0.5 rounded text-[10px] font-mono text-ink-muted bg-surface-default border border-border-base">
              ESC
            </kbd>
          </div>

          {/* ── List ───────────────────────────── */}
          <CommandList className="max-h-90 overflow-y-auto py-2 px-2">
            <CommandEmpty className="py-8 text-center text-[12px] font-mono text-ink-muted">
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
                  "data-[selected=true]:bg-purple-950 data-[selected=true]:border-border-accent",
                  "hover:bg-purple-950 hover:border-border-accent",
                )}
              >
                <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-md bg-surface-default border border-border-base">
                  <Plus size={14} className="text-purple-400" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium font-mono text-ink-primary">
                    Create New {capitalised}Snippet
                  </span>
                  <span className="text-[11px] font-mono text-ink-muted">
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
                  <Search size={14} className="text-ink-muted ml-1 shrink-0" />
                  <span className="text-[12px] font-mono text-ink-secondary">
                    Search globally for &quot;
                    <span className="text-ink-primary">{query}</span>
                    &quot;
                  </span>
                </CommandItem>
              )}
            </CommandGroup>

            <CommandSeparator className="my-1.5 mx-2 bg-border-subtle" />

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
                  <p className="px-3 py-2 text-[11px] font-mono text-ink-muted">
                    Loading your snippets...
                  </p>
                ) : (
                  <p className="px-3 py-2 text-[11px] font-mono text-ink-muted">
                    No snippets match &quot;{query}&quot;
                  </p>
                )
              ) : (
                matchedSnippets.map((snippet) => (
                  <CommandItem
                    key={snippet.id}
                    value={`${snippet.id}-${snippet.title}`}
                    onSelect={() => navigate(`/snippets/${snippet.id}`)}
                    className={baseItem}
                  >
                    <Code2
                      size={14}
                      className="text-ink-muted shrink-0 ml-0.5"
                    />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[13px] font-medium font-mono text-ink-primary truncate">
                        {snippet.title}
                      </span>
                      <span className="text-[11px] font-mono text-ink-muted">
                        Language: {snippet.language}
                        <span className="mx-1.5 text-ink-disabled">•</span>
                        Last edited {snippet.lastEdited}
                      </span>
                    </div>
                  </CommandItem>
                ))
              )}
            </CommandGroup>

            <CommandSeparator className="my-1.5 mx-2 bg-border-subtle" />

            {/* Navigation */}
            <CommandGroup heading="Navigation" className={groupHeading}>
              <CommandItem
                value="go-to-collections"
                onSelect={() => navigate("/collections")}
                className={baseItem}
              >
                <FolderOpen
                  size={14}
                  className="text-ink-muted shrink-0 ml-0.5"
                />
                <span className="text-[13px] font-mono text-ink-secondary">
                  Go to Collections
                </span>
              </CommandItem>

              <CommandItem
                value="go-to-favorites"
                onSelect={() => navigate("/favorites")}
                className={baseItem}
              >
                <Star size={14} className="text-ink-muted shrink-0 ml-0.5" />
                <span className="text-[13px] font-mono text-ink-secondary">
                  Go to Favorites
                </span>
              </CommandItem>
            </CommandGroup>
          </CommandList>

          {/* ── Footer ─────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-surface-shell border-t border-border-subtle">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-[10px] font-mono text-ink-muted">
                <ChevronUp size={10} className="text-ink-disabled" />
                <ChevronDown size={10} className="text-ink-disabled" />
                to navigate
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-ink-muted">
                <CornerDownLeft size={10} className="text-ink-disabled" />
                to select
              </span>
            </div>
            <span className="text-[10px] font-mono text-ink-disabled">
              SnippetVault Command v2.1
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
