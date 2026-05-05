"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { CodeViewer } from "@/components/shared/CodeViewer";

// Replace with your actual import
// import CodeViewer from "@/components/common/CodeViewer";

type Snippet = {
  id: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
  starred: boolean;
  addedAt: string;
  code: string;
};

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
];

function Tag({ label }: { label: string }) {
  return <span className="lang-tag lang-tag--js">{label.toUpperCase()}</span>;
}

export default function FavoritesPage() {
  const favorites = MOCK_SNIPPETS.filter((s) => s.starred);

  return (
    <div className="flex-1 bg-surface-base p-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs text-ink-muted">
          WORKSPACE / FAVORITES
        </p>
        <h1 className="text-lg font-semibold mt-1">Starred Snippets</h1>
      </div>

      {/* Empty State */}
      {favorites.length === 0 && (
        <div className="text-center text-sm text-ink-muted">
          No starred snippets yet.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {favorites.map((snippet) => (
          <Card
            key={snippet.id}
            className="border border-border-base bg-surface-default flex flex-col"
          >
            <CardContent className="p-0 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between px-4 py-3 border-b border-border-base">
                <div>
                  <h3 className="text-sm font-semibold text-ink-primary">{snippet.title}</h3>
                  <p className="text-xs text-ink-secondary">
                    {snippet.description}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-purple-400"
                >
                  <Star size={16} fill="currentColor" />
                </Button>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border-base">
                <span className="text-[10px] text-ink-muted">
                  {snippet.language}
                </span>

                {snippet.tags.map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}

                <span className="ml-auto text-[10px] text-ink-muted">
                  {snippet.addedAt}
                </span>
              </div>

              {/* Code */}
              <div className="overflow-x-auto overflow-y-hidden flex-1">
                <pre className="px-4 py-3 text-[11px] leading-[1.7] text-ink-secondary font-mono whitespace-pre min-h-40 max-h-55 overflow-y-auto">
                  <CodeViewer code={snippet.code} language={snippet.language} />
                </pre>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
