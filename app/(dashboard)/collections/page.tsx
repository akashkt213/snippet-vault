"use client";

import { useQuery } from "@tanstack/react-query";
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
import { apiClient } from "@/lib/api/client";

type CollectionApiItem = {
  id: string;
  name: string;
  description: string | null;
};

type CollectionsResponse = {
  data: CollectionApiItem[];
};

const ICONS = [Folder, Database, LayoutGrid, Box, Shield, Server] as const;

function formatCount(count: number) {
  return `${String(count).padStart(2, "0")} SNIPPETS`;
}

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
  const {
    data: collectionsResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["collections"],
    queryFn: () =>
      apiClient.get<CollectionsResponse>("/api/collections", {
        timeoutMs: 12_000,
        retries: 2,
      }),
  });

  const collections = collectionsResponse?.data ?? [];

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
        {isLoading ? (
          <div className="col-span-full py-10 text-center text-sm text-ink-muted">
            Loading collections...
          </div>
        ) : isError ? (
          <div className="col-span-full py-10 text-center text-sm text-red-400">
            Failed to load collections.
          </div>
        ) : collections.length === 0 ? (
          <div className="col-span-full py-10 text-center text-sm text-ink-muted">
            No collections found yet.
          </div>
        ) : (
          collections.map((item, index) => {
            const Icon = ICONS[index % ICONS.length];

            return (
              <Card
                key={item.id}
                className="group cursor-pointer border border-border-base bg-surface-default hover:bg-surface-hover transition"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top */}
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-md bg-purple-950 text-purple-400">
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] text-ink-muted">
                      {formatCount(0)}
                    </span>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-sm font-semibold text-ink-primary">
                      {item.name}
                    </h3>
                    <p className="text-xs text-ink-secondary mt-1">
                      {item.description || "No description provided."}
                    </p>
                  </div>

                  {/* Tags placeholder */}
                  <div className="flex gap-2">
                    <Tag label="db" />
                    <Tag label="collection" />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}

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