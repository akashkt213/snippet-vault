"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  Loader2,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";

import { CodeViewer } from "@/components/shared/CodeViewer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api/client";
import { useDeleteConfirmDialog } from "@/lib/hooks/useDeleteConfirmDialog";
import { getLangExtension } from "@/lib/getLangExtension";

type Collection = {
  id: string;
  name: string;
};

type SnippetDetail = {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[];
  isFavorite: boolean;
  collectionId: string;
  collection: Collection;
  createdAt: string;
  updatedAt: string;
};

type SnippetResponse = {
  data: SnippetDetail;
};

type CollectionsResponse = {
  data: Collection[];
};

type EditorLanguage = Parameters<typeof getLangExtension>[0];

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SnippetDetailPage() {
  const params = useParams<{ snippetId: string }>();
  const snippetId = params.snippetId;
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: snippet,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["snippet", snippetId],
    queryFn: async () => {
      const response = await apiClient.get<SnippetResponse>(
        `/api/snippets/${encodeURIComponent(snippetId)}`,
      );
      return response.data;
    },
    enabled: Boolean(snippetId),
  });

  const { data: collectionsResponse } = useQuery({
    queryKey: ["collections"],
    queryFn: () => apiClient.get<CollectionsResponse>("/api/collections"),
  });

  const collections = collectionsResponse?.data ?? [];

  const favoriteMutation = useMutation({
    mutationFn: (isFavorite: boolean) =>
      apiClient.patch(`/api/snippets/${snippetId}/favorite`, { isFavorite }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["snippet", snippetId] }),
        queryClient.invalidateQueries({ queryKey: ["snippets"] }),
        queryClient.invalidateQueries({ queryKey: ["collection-snippets"] }),
      ]);
    },
  });

  const moveMutation = useMutation({
    mutationFn: (collectionId: string) =>
      apiClient.patch(`/api/snippets/${snippetId}`, { collectionId }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["snippet", snippetId] }),
        queryClient.invalidateQueries({ queryKey: ["snippets"] }),
        queryClient.invalidateQueries({ queryKey: ["collection-snippets"] }),
        queryClient.invalidateQueries({ queryKey: ["collections"] }),
      ]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/api/snippets/${snippetId}`),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["snippets"] }),
        queryClient.invalidateQueries({ queryKey: ["collection-snippets"] }),
        queryClient.invalidateQueries({ queryKey: ["collections"] }),
      ]);
      closeDeleteDialog();
      router.push("/dashboard");
    },
  });

  const { requestDelete, closeDeleteDialog, dialog } = useDeleteConfirmDialog(
    deleteMutation.isPending,
  );

  const handleDelete = () => {
    if (!snippet) return;

    requestDelete({
      title: "Delete snippet?",
      description: `"${snippet.title}" will be permanently removed. This action cannot be undone.`,
      onConfirm: () => deleteMutation.mutate(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-surface-base p-6">
        <Loader2 size={18} className="animate-spin text-purple-400" />
      </div>
    );
  }

  if (isError || !snippet) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-surface-base p-6 text-center">
        <p className="text-sm text-red-400">Snippet not found.</p>
        <Button asChild variant="secondary">
          <Link href="/dashboard">
            <ArrowLeft size={14} />
            Back to dashboard
          </Link>
        </Button>
      </div>
    );
  }

  const editorLanguage = snippet.language as EditorLanguage;

  return (
    <div className="flex flex-1 flex-col bg-surface-base">
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle bg-surface-shell px-5 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-mono uppercase tracking-[0.08em] text-ink-muted">
            Workspace / Snippets
          </p>
          <h1 className="truncate text-[18px] font-semibold text-ink-primary font-mono">
            {snippet.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary">
            <Link href="/dashboard">
              <ArrowLeft size={14} />
              Back
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/snippets/${snippet.id}/edit`}>
              <Pencil size={14} />
              Edit
            </Link>
          </Button>
          <Button
            variant="secondary"
            onClick={() => favoriteMutation.mutate(!snippet.isFavorite)}
            disabled={favoriteMutation.isPending}
          >
            <Star
              size={14}
              fill={snippet.isFavorite ? "#a78bfa" : "none"}
              className={snippet.isFavorite ? "text-purple-400" : undefined}
            />
            {snippet.isFavorite ? "Starred" : "Star"}
          </Button>
          <Button
            variant="secondary"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="hover:border-[#5c2b2b] hover:text-red-400"
          >
            {deleteMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Delete
          </Button>
        </div>
      </div>

      <div className="grid flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-h-0 border-b border-border-subtle lg:border-b-0 lg:border-r">
          <div className="border-b border-border-subtle px-4 py-3">
            <p className="text-[12px] leading-relaxed text-ink-muted font-mono">
              {snippet.description || "No description provided."}
            </p>
          </div>
          <div className="min-h-[28rem] overflow-hidden bg-surface-shell">
            <pre className="h-full overflow-auto px-4 py-3 text-[11px] leading-[1.7] text-ink-secondary font-mono whitespace-pre">
              <CodeViewer code={snippet.code} language={editorLanguage} />
            </pre>
          </div>
        </div>

        <aside className="flex flex-col gap-5 p-5">
          <div>
            <p className="text-[10px] font-semibold font-mono uppercase tracking-[0.08em] text-ink-muted">
              Collection
            </p>
            <Select
              value={snippet.collectionId}
              onValueChange={(collectionId) => moveMutation.mutate(collectionId)}
              disabled={moveMutation.isPending}
            >
              <SelectTrigger className="mt-2 h-9 bg-transparent border-border-base text-[12px] font-mono">
                <SelectValue placeholder="Select collection..." />
              </SelectTrigger>
              <SelectContent className="bg-surface-hover border-border-base font-mono text-[11px]">
                {collections.map((collection) => (
                  <SelectItem
                    key={collection.id}
                    value={collection.id}
                    className="text-[11px] font-mono"
                  >
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-2 text-[11px] text-ink-disabled font-mono">
              Move this snippet to another collection.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold font-mono uppercase tracking-[0.08em] text-ink-muted">
              Language
            </p>
            <p className="mt-2 text-[12px] font-mono text-ink-primary">
              {snippet.language}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold font-mono uppercase tracking-[0.08em] text-ink-muted">
              Tags
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {snippet.tags.length > 0 ? (
                snippet.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-border-base bg-border-subtle px-2 py-0.5 text-[10px] font-mono text-ink-muted"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-[11px] text-ink-disabled font-mono">No tags</p>
              )}
            </div>
          </div>

          <div className="space-y-2 text-[11px] text-ink-muted font-mono">
            <div className="flex items-center gap-2">
              <Clock size={12} />
              <span>Created {formatTimestamp(snippet.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={12} />
              <span>Updated {formatTimestamp(snippet.updatedAt)}</span>
            </div>
          </div>
        </aside>
      </div>
      {dialog}
    </div>
  );
}
