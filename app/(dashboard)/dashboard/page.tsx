"use client";

import { useState } from "react";
import { Filter, Code2 } from "lucide-react";
import SnippetCard, {
  Snippet,
} from "@/components/shared/SnippetCard";
import { cn } from "@/lib/utils";

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_SNIPPETS: Snippet[] = [
  {
    id: "1",
    title: "useDebounce",
    description: "Custom hook for delaying value updates.",
    language: "REACT",
    tags: ["hooks", "utils"],
    starred: false,
    addedAt: "2d ago",
    code: `import { useState, useEffect } from 'react'

export function useDebounce(value, delay) {
  const [debouncedValue, setDebounced] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}`,
  },
  {
    id: "2",
    title: "Singleton Pattern",
    description: "Double-checked locking implementation.",
    language: "JAVA",
    tags: ["patterns", "oop"],
    starred: true,
    addedAt: "5d ago",
    code: `public class Singleton {
  private static volatile Singleton instance

  private Singleton() {}

  public static Singleton getInstance() {
    if (instance == null) {
      synchronized (Singleton.class) {
        if (instance == null) {
          instance = new Singleton()
        }
      }
    }
    return instance
  }
}`,
  },
  {
    id: "3",
    title: "Deep Clone Object",
    description: "Modern structuredClone or fallback.",
    language: "JS",
    tags: ["utils"],
    starred: false,
    addedAt: "1w ago",
    code: `const deepClone = (obj) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj)
  }

  // Fallback for older environments
  return JSON.parse(JSON.stringify(obj))
}

const original = { a: 1, b: { c: 2 } }
const copy = deepClone(original)`,
  },
  {
    id: "4",
    title: "GH Actions Build",
    description: "Standard Node.js CI pipeline configuration.",
    language: "YAML",
    tags: ["ci", "devops"],
    starred: false,
    addedAt: "2w ago",
    code: `name: Node.js CI

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'`,
  },
  {
    id: "5",
    title: "fetch with retry",
    description: "Retry failed requests with exponential backoff.",
    language: "TS",
    tags: ["api", "async"],
    starred: true,
    addedAt: "3d ago",
    code: `async function fetchWithRetry(
  url: string,
  n: number = 3
): Promise<Response> {
  for (let i = 0; i < n; i++) {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(response.statusText)
      return response
    } catch (err) {
      if (i === n - 1) throw err
      await new Promise(r => setTimeout(r, 2 ** i * 1000))
    }
  }
  throw new Error('Max retries exceeded')
}`,
  },
  {
    id: "6",
    title: "Tailwind cx helper",
    description: "Class merging utility with conditional support.",
    language: "TS",
    tags: ["utils", "tailwind"],
    starred: false,
    addedAt: "4d ago",
    code: `import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
const cls = cn(
  'px-4 py-2 rounded',
  isActive && 'bg-purple-600',
  className
)`,
  },
];

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
  const [snippets, setSnippets] = useState<Snippet[]>(MOCK_SNIPPETS);
  const [activeFilter, setFilter] = useState("all");

  const handleStar = (id: string) => {
    setSnippets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, starred: !s.starred } : s)),
    );
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
      {filtered.length === 0 ? (
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
