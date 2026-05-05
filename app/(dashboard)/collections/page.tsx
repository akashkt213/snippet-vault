"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Folder,
  LayoutGrid,
  Database,
  Box,
  Shield,
  Server,
  Plus,
} from "lucide-react";

const collections = [
  {
    title: "React Hooks",
    description:
      "Reusable custom hooks for production-ready frontend state management.",
    icon: Folder,
    count: "24 SNIPPETS",
    tags: ["ts", "js"],
  },
  {
    title: "Database Utils",
    description:
      "Optimized queries and connection management for PostgreSQL and Redis.",
    icon: Database,
    count: "12 SNIPPETS",
    tags: ["sql", "node"],
  },
  {
    title: "CSS Layouts",
    description:
      "Modern Grid and Flexbox patterns for responsive UI architecture.",
    icon: LayoutGrid,
    count: "08 SNIPPETS",
    tags: ["css", "html"],
  },
  {
    title: "API Clients",
    description:
      "Standardized wrappers for third-party services and REST integrations.",
    icon: Box,
    count: "15 SNIPPETS",
    tags: ["ts", "json"],
  },
  {
    title: "Auth Patterns",
    description:
      "JWT handling, OAuth flows, and protected route logic.",
    icon: Shield,
    count: "06 SNIPPETS",
    tags: ["ts", "go"],
  },
  {
    title: "Infrastructure",
    description:
      "Dockerfiles, CI/CD pipelines, and shell scripting utilities.",
    icon: Server,
    count: "07 SNIPPETS",
    tags: ["yaml", "bash"],
  },
];

function Tag({ label }: { label: string }) {
  const map: Record<string, string> = {
    js: "lang-tag--js",
    ts: "lang-tag--ts",
    py: "lang-tag--py",
    css: "lang-tag--css",
    html: "lang-tag--css",
    rust: "lang-tag--rust",
    sql: "lang-tag--sql",
    yaml: "lang-tag--yaml",
    java: "lang-tag--java",
    node: "lang-tag--py",
    go: "lang-tag--rust",
    bash: "lang-tag--yaml",
    json: "lang-tag--js",
  };

  return (
    <span className={`lang-tag ${map[label] || ""}`}>
      {label.toUpperCase()}
    </span>
  );
}

export default function CollectionPage() {
  return (
    <div className="flex-1 bg-surface-base p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-ink-muted">
            WORKSPACE / SNIPPETS
          </p>
          <h1 className="text-lg font-semibold mt-1">
            Snippet Library
          </h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-xs bg-surface-default border-border-base hover:bg-surface-hover"
          >
            SORT: RECENT
          </Button>
          <Button
            variant="outline"
            className="text-xs bg-surface-default border-border-base hover:bg-surface-hover"
          >
            FILTER
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {collections.map((item, index) => {
          const Icon = item.icon;

          return (
            <Card
              key={index}
              className="group cursor-pointer border border-border-base bg-surface-default hover:bg-surface-hover transition"
            >
              <CardContent className="p-5 space-y-4">
                {/* Top */}
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-md bg-purple-950 text-purple-400">
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] text-ink-muted">
                    {item.count}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-sm font-semibold text-ink-primary">
                    {item.title}
                  </h3>
                  <p className="text-xs text-ink-secondary mt-1">
                    {item.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex gap-2">
                  {item.tags.map((tag) => (
                    <Tag key={tag} label={tag} />
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* New Collection */}
        <div className="border border-dashed border-border-base rounded-lg flex items-center justify-center min-h-45 hover:border-border-hover transition cursor-pointer">
          <div className="text-center space-y-2">
            <div className="mx-auto w-10 h-10 rounded-md flex items-center justify-center bg-surface-raised">
              <Plus size={18} />
            </div>
            <p className="text-sm">New Collection</p>
            <p className="text-xs text-ink-muted">
              INITIALIZE DIRECTORY
            </p>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 rounded-full bg-purple-600 hover:bg-purple-400 shadow-lg"
      >
        <Plus />
      </Button>
    </div>
  );
}