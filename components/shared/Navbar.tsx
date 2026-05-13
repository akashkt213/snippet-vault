"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Settings,
  HelpCircle,
  Command,
  X,
  Code2,
} from "lucide-react";
import { fetchSnippetSearch } from "@/lib/api/snippetSearch";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";
import CommandPalette from "./CommandPalette";
import HelpDialog from "./HelpDialog";
import { useHelpDialog } from "@/lib/store/help-dialog";

const LANG: Record<string, { bg: string; text: string }> = {
  REACT: { bg: "#1a2340", text: "#93c5fd" },
  JAVA: { bg: "#2d1a1f", text: "#fda4af" },
  JS: { bg: "#1e1333", text: "#c4b5fd" },
  TS: { bg: "#1e1333", text: "#a78bfa" },
  YAML: { bg: "#2a2010", text: "#fcd34d" },
  PY: { bg: "#1e2d1e", text: "#86efac" },
  CSS: { bg: "#1a2340", text: "#93c5fd" },
};

export default function Navbar() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { setIsOpen: setHelpOpen } = useHelpDialog();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const debouncedQuery = useDebouncedValue(query, 250);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["snippet-search", debouncedQuery, 8],
    queryFn: () => fetchSnippetSearch(debouncedQuery, 8),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 30_000,
  });

  const showDrop = open && query.length > 0;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        router.push("/newsnippet");
      }
      if (e.key === "/" && !(e.metaKey || e.ctrlKey || e.altKey)) {
        const target = e.target as HTMLElement | null;
        const isTypingTarget =
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target?.getAttribute("contenteditable") === "true";

        if (!isTypingTarget) {
          e.preventDefault();
          inputRef.current?.focus();
          setOpen(true);
        }
      }
      if (e.key === "Escape") {
        setQuery("");
        setOpen(false);
        inputRef.current?.blur();
        setHelpOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [router, setHelpOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDrop) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && results[selectedIdx]) {
      const snippetId = results[selectedIdx].id;
      setQuery("");
      setOpen(false);
      router.push(`/snippets/${snippetId}`);
    }
  };

  return (
    <header className="h-14 flex items-center gap-3.5 px-5 bg-surface-shell border-b border-border-subtle sticky top-0 z-50">
      <div className="relative flex-1 max-w-115">
        <div
          className={cn(
            "flex items-center gap-2 px-2.5 rounded-lg",
            "bg-surface-default border transition-colors duration-150",
            open ? "border-[#3d2f6e]" : "border-border-base",
          )}
        >
          <Search size={13} className="text-[#444444] shrink-0" />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder="Search snippets, tags, or languages..."
            autoComplete="off"
            spellCheck={false}
            className={cn(
              "flex-1 py-2.5 bg-transparent border-none outline-none",
              "text-[12px] text-[#cccccc] placeholder:text-[#444444]",
              "font-mono",
            )}
          />

          {query ? (
            <button
              onMouseDown={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="flex items-center justify-center text-[#555555] hover:text-ink-secondary transition-colors p-0.5 rounded"
            >
              <X size={12} />
            </button>
          ) : (
            <span className="flex items-center gap-0.5 shrink-0 text-[10px] text-[#444444] bg-border-subtle border border-border-base rounded px-1.5 py-0.5 font-mono">
              <Command size={9} />K
            </span>
          )}
        </div>

        {showDrop && (
          <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-surface-raised border border-border-base rounded-xl overflow-hidden z-50 py-1">
            {isFetching ? (
              <p className="text-[12px] text-[#555555] text-center py-4 font-mono">
                Searching...
              </p>
            ) : results.length === 0 ? (
              <p className="text-[12px] text-[#555555] text-center py-4 font-mono">
                No results for &quot;{query}&quot;
              </p>
            ) : (
              <>
                <p className="text-[9px] font-semibold tracking-widest uppercase text-[#444444] px-3 pt-2 pb-1 font-mono">
                  snippets
                </p>

                {results.map((item, i) => {
                  const lang = LANG[item.language.toUpperCase()] ?? {
                    bg: "#1e1e1e",
                    text: "#aaaaaa",
                  };

                  return (
                    <button
                      key={item.id}
                      onMouseDown={() => {
                        setQuery("");
                        setOpen(false);
                        router.push(`/snippets/${item.id}`);
                      }}
                      onMouseEnter={() => setSelectedIdx(i)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-1.75",
                        "text-left transition-colors duration-75",
                        i === selectedIdx
                          ? "bg-purple-950"
                          : "hover:bg-border-subtle",
                      )}
                    >
                      <Code2 size={12} className="text-[#555555] shrink-0" />
                      <span
                        className={cn(
                          "flex-1 text-[12px] font-mono truncate",
                          i === selectedIdx
                            ? "text-purple-300"
                            : "text-[#cccccc]",
                        )}
                      >
                        {item.title}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] text-[#555555] bg-border-subtle rounded px-1.5 py-0.5 font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded font-mono tracking-[0.04em]"
                          style={{ background: lang.bg, color: lang.text }}
                        >
                          {item.language}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 ml-auto">
          <button
            key={'Settings'}
            title={'Settings'}
            onClick={() => router.push('/user')}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg",
              "text-[#555555] bg-transparent border-none",
              "hover:bg-surface-raised hover:text-ink-secondary",
              "transition-colors duration-120",
            )}
          >
            <Settings size={15} />
          </button>
          <button
            key={'Help'}
            title={'Help'}
            onClick={() => setHelpOpen(true)}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg",
              "text-[#555555] bg-transparent border-none",
              "hover:bg-surface-raised hover:text-ink-secondary",
              "transition-colors duration-120",
            )}
          >
            <HelpCircle size={15} />
          </button>

        <div className="w-px h-4.5 bg-border-base mx-1.5" />

        <button
          onClick={() => router.push("/newsnippet")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.75 rounded-lg",
            "bg-purple-950 border border-[#3d2f6e]",
            "text-purple-300 text-[12px] font-medium font-mono tracking-[0.03em]",
            "hover:bg-[#2a1a4a] hover:border-purple-600 hover:text-[#ddd6fe]",
            "active:scale-[0.98]",
            "transition-all duration-150 whitespace-nowrap",
          )}
        >
          <Plus size={14} />
          New Snippet
        </button>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <HelpDialog />
    </header>
  );
}
