"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Bell,
  Settings,
  HelpCircle,
  Command,
  X,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
type Snippet = {
  id: number;
  title: string;
  language: string;
  tags: string[];
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const SNIPPETS: Snippet[] = [
  { id: 1, title: "useDebounce",          language: "REACT", tags: ["hooks", "utils"] },
  { id: 2, title: "Singleton Pattern",    language: "JAVA",  tags: ["patterns"]       },
  { id: 3, title: "Deep Clone Object",    language: "JS",    tags: ["utils"]          },
  { id: 4, title: "GH Actions Build",    language: "YAML",  tags: ["ci", "devops"]   },
  { id: 5, title: "fetch with retry",     language: "TS",    tags: ["api", "async"]   },
  { id: 6, title: "useMemoizedCallback",  language: "REACT", tags: ["hooks"]          },
];

// ── Language tag colours (bg / text) ──────────────────────────────────────────
const LANG: Record<string, { bg: string; text: string }> = {
  REACT: { bg: "#1a2340", text: "#93c5fd" },
  JAVA:  { bg: "#2d1a1f", text: "#fda4af" },
  JS:    { bg: "#1e1333", text: "#c4b5fd" },
  TS:    { bg: "#1e1333", text: "#a78bfa" },
  YAML:  { bg: "#2a2010", text: "#fcd34d" },
  PY:    { bg: "#1e2d1e", text: "#86efac" },
  CSS:   { bg: "#1a2340", text: "#93c5fd" },
};

// ── Fuzzy search ──────────────────────────────────────────────────────────────
function fuzzy(str: string, q: string) {
  str = str.toLowerCase();
  q   = q.toLowerCase();
  let si = 0;
  for (let qi = 0; qi < q.length; qi++) {
    while (si < str.length && str[si] !== q[qi]) si++;
    if (si >= str.length) return false;
    si++;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query,       setQuery]       = useState("");
  const [open,        setOpen]        = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const results = query
    ? SNIPPETS.filter(
        (s) =>
          fuzzy(s.title, query) ||
          fuzzy(s.language, query) ||
          s.tags.some((t) => fuzzy(t, query))
      )
    : [];

  const showDrop = open && query.length > 0;

  // Global Cmd+K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setQuery("");
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset selection when results change
  useEffect(() => { setSelectedIdx(0); }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDrop) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter"  && results[selectedIdx]) { setQuery(""); setOpen(false); }
  };

  return (
    <header className="h-14 flex items-center gap-3.5 px-5 bg-[#0f0f0f] border-b border-[#1e1e1e] sticky top-0 z-50">

      {/* ── Search bar ──────────────────────────── */}
      <div className="relative flex-1 max-w-115">
        {/* Input wrapper */}
        <div
          className={cn(
            "flex items-center gap-2 px-2.5 rounded-lg",
            "bg-[#141414] border transition-colors duration-150",
            open ? "border-[#3d2f6e]" : "border-[#2a2a2a]"
          )}
        >
          {/* Search icon */}
          <Search size={13} className="text-[#444444] shrink-0" />

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder="Search snippets, tags, or languages..."
            autoComplete="off"
            spellCheck={false}
            className={cn(
              "flex-1 py-2.5 bg-transparent border-none outline-none",
              "text-[12px] text-[#cccccc] placeholder:text-[#444444]",
              "font-mono"
            )}
          />

          {/* Clear button OR Cmd+K badge */}
          {query ? (
            <button
              onMouseDown={() => { setQuery(""); inputRef.current?.focus(); }}
              className="flex items-center justify-center text-[#555555] hover:text-[#aaaaaa] transition-colors p-0.5 rounded"
            >
              <X size={12} />
            </button>
          ) : (
            <span className="flex items-center gap-0.5 shrink-0 text-[10px] text-[#444444] bg-[#1e1e1e] border border-[#2a2a2a] rounded px-1.5 py-0.5 font-mono">
              <Command size={9} />K
            </span>
          )}
        </div>

        {/* ── Dropdown ──────────────────────────── */}
        {showDrop && (
          <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden z-50 py-1">
            {results.length === 0 ? (
              <p className="text-[12px] text-[#555555] text-center py-4 font-mono">
                No results for &quot;{query}&quot;
              </p>
            ) : (
              <>
                {/* Section label */}
                <p className="text-[9px] font-semibold tracking-widest uppercase text-[#444444] px-3 pt-2 pb-1 font-mono">
                  snippets
                </p>

                {results.map((item, i) => {
                  const lang = LANG[item.language] ?? { bg: "#1e1e1e", text: "#aaaaaa" };
                  return (
                    <button
                      key={item.id}
                      onMouseDown={() => { setQuery(""); setOpen(false); }}
                      onMouseEnter={() => setSelectedIdx(i)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-1.75",
                        "text-left transition-colors duration-75",
                        i === selectedIdx ? "bg-[#1e1333]" : "hover:bg-[#1e1e1e]"
                      )}
                    >
                      {/* Icon */}
                      <Code2 size={12} className="text-[#555555] shrink-0" />

                      {/* Title */}
                      <span
                        className={cn(
                          "flex-1 text-[12px] font-mono truncate",
                          i === selectedIdx ? "text-[#c4b5fd]" : "text-[#cccccc]"
                        )}
                      >
                        {item.title}
                      </span>

                      {/* Tags + language pill */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] text-[#555555] bg-[#1e1e1e] rounded px-1.5 py-0.5 font-mono"
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

      {/* ── Right side actions ──────────────────── */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Icon buttons */}
        {[
          { icon: Bell,        title: "Notifications" },
          { icon: Settings,    title: "Settings"      },
          { icon: HelpCircle,  title: "Help"          },
        ].map(({ icon: Icon, title }) => (
          <button
            key={title}
            title={title}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg",
              "text-[#555555] bg-transparent border-none",
              "hover:bg-[#1a1a1a] hover:text-[#aaaaaa]",
              "transition-colors duration-120"
            )}
          >
            <Icon size={15} />
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-4.5 bg-[#2a2a2a] mx-1.5" />

        {/* New snippet button */}
        <button
          onClick={() => router.push("/newsnippet")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.75 rounded-lg",
            "bg-[#1e1333] border border-[#3d2f6e]",
            "text-[#c4b5fd] text-[12px] font-medium font-mono tracking-[0.03em]",
            "hover:bg-[#2a1a4a] hover:border-[#6d28d9] hover:text-[#ddd6fe]",
            "active:scale-[0.98]",
            "transition-all duration-150 whitespace-nowrap"
          )}
        >
          <Plus size={14} />
          New Snippet
        </button>
      </div>

    </header>
  );
}