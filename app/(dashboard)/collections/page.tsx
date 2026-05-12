"use client";

import { FormEvent, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Folder,
  LayoutGrid,
  Database,
  Box,
  Shield,
  Server,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useDeleteConfirmDialog } from "@/lib/hooks/useDeleteConfirmDialog";
import { cn } from "@/lib/utils";

type CollectionApiItem = {
  id: string;
  name: string;
  description: string | null;
  snippetCount: number;
};

type CollectionsResponse = {
  data: CollectionApiItem[];
};

type CollectionResponse = {
  data: CollectionApiItem;
};

const ICONS = [Folder, Database, LayoutGrid, Box, Shield, Server] as const;

function formatCount(count: number) {
  return `${String(count).padStart(2, "0")} SNIPPETS`;
}

export default function CollectionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreateSheetOpen, setCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setEditSheetOpen] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(
    null,
  );
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

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

  const createCollectionMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      apiClient.post("/api/collections", payload, {
        timeoutMs: 12_000,
        retries: 1,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["collections"] });
      setCreateSheetOpen(false);
      setNewCollectionName("");
      setNewCollectionDescription("");
      setCreateError(null);
    },
    onError: () => {
      setCreateError("Failed to create collection. Please try again.");
    },
  });

  const updateCollectionMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { name: string; description?: string };
    }) =>
      apiClient.patch<CollectionResponse>(
        `/api/collections/${encodeURIComponent(id)}`,
        payload,
        { timeoutMs: 12_000, retries: 1 },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["collections"] });
      if (editingCollectionId) {
        await queryClient.invalidateQueries({
          queryKey: ["collection", editingCollectionId],
        });
      }
      setEditSheetOpen(false);
      setEditingCollectionId(null);
      setEditError(null);
    },
    onError: () => {
      setEditError("Failed to update collection. Please try again.");
    },
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/api/collections/${encodeURIComponent(id)}`, {
        timeoutMs: 12_000,
        retries: 1,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["collections"] }),
        queryClient.invalidateQueries({ queryKey: ["snippets"] }),
        queryClient.invalidateQueries({ queryKey: ["collection-snippets"] }),
      ]);
      closeDeleteDialog();
    },
  });

  const { requestDelete, closeDeleteDialog, dialog } = useDeleteConfirmDialog(
    deleteCollectionMutation.isPending,
  );

  const handleCreateCollection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newCollectionName.trim();
    if (!name) {
      setCreateError("Collection name is required.");
      return;
    }

    setCreateError(null);
    createCollectionMutation.mutate({
      name,
      description: newCollectionDescription.trim() || undefined,
    });
  };

  const openEditSheet = (
    item: CollectionApiItem,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    setEditingCollectionId(item.id);
    setEditName(item.name);
    setEditDescription(item.description ?? "");
    setEditError(null);
    setEditSheetOpen(true);
  };

  const handleUpdateCollection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingCollectionId) return;

    const name = editName.trim();
    if (!name) {
      setEditError("Collection name is required.");
      return;
    }

    setEditError(null);
    updateCollectionMutation.mutate({
      id: editingCollectionId,
      payload: {
        name,
        description: editDescription.trim() || undefined,
      },
    });
  };

  const handleDeleteCollection = (
    item: CollectionApiItem,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    const snippetLabel =
      item.snippetCount === 1 ? "1 snippet" : `${item.snippetCount} snippets`;

    requestDelete({
      title: "Delete collection?",
      description: `"${item.name}" and ${snippetLabel} will be permanently removed. This action cannot be undone.`,
      onConfirm: () => deleteCollectionMutation.mutate(item.id),
    });
  };

  const actionButtonClassName = cn(
    "flex items-center justify-center rounded-md border p-1.5",
    "border-border-base bg-border-subtle text-ink-muted transition-all duration-150",
    "hover:border-[#3d2f6e] hover:text-purple-300",
  );

  return (
    <div className="flex-1 bg-surface-base p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-ink-muted">WORKSPACE / SNIPPETS</p>
          <h1 className="text-lg font-semibold mt-1">Snippet Library</h1>
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
                onClick={() => router.push(`/collections/${item.id}`)}
              >
                <CardContent className="flex min-h-45 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-md bg-purple-950 p-2 text-purple-400">
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] text-ink-muted">
                      {formatCount(item.snippetCount)}
                    </span>
                  </div>

                  <div className="mt-4 flex-1">
                    <h3 className="text-sm font-semibold text-ink-primary">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-xs text-ink-secondary">
                      {item.description || "No description provided."}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={(event) => openEditSheet(item, event)}
                        className={actionButtonClassName}
                        title="Edit collection"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => handleDeleteCollection(item, event)}
                        disabled={deleteCollectionMutation.isPending}
                        className={cn(
                          actionButtonClassName,
                          "hover:border-[#5c2b2b] hover:text-red-400",
                        )}
                        title="Delete collection"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                </CardContent>
              </Card>
            );
          })
        )}

        {/* New Collection */}
        <div
          className="border border-dashed border-border-base rounded-lg flex items-center justify-center min-h-45 hover:border-border-hover transition cursor-pointer"
          onClick={() => setCreateSheetOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setCreateSheetOpen(true);
            }
          }}
        >
          <div className="text-center space-y-2">
            <div className="mx-auto w-10 h-10 rounded-md flex items-center justify-center bg-surface-raised">
              <Plus size={18} />
            </div>
            <p className="text-sm">New Collection</p>
            <p className="text-xs text-ink-muted">INITIALIZE DIRECTORY</p>
          </div>
        </div>
      </div>

      <Sheet open={isCreateSheetOpen} onOpenChange={setCreateSheetOpen}>
        <SheetContent
          side="right"
          className="bg-surface-shell border-border-base"
        >
          <SheetHeader>
            <SheetTitle className="text-ink-primary">
              Create New Collection
            </SheetTitle>
            <SheetDescription>
              Add a new collection to organize your snippets.
            </SheetDescription>
          </SheetHeader>
          <form className="mt-6 space-y-4" onSubmit={handleCreateCollection}>
            <div className="space-y-1.5">
              <label className="text-xs text-ink-muted">Name</label>
              <Input
                value={newCollectionName}
                onChange={(event) => setNewCollectionName(event.target.value)}
                placeholder="e.g. React Helpers"
                className="bg-surface-default border-border-base"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-ink-muted">Description</label>
              <Textarea
                value={newCollectionDescription}
                onChange={(event) =>
                  setNewCollectionDescription(event.target.value)
                }
                placeholder="Short description for this collection..."
                className="bg-surface-default border-border-base"
                rows={4}
              />
            </div>
            {createError ? (
              <p className="text-sm text-red-400">{createError}</p>
            ) : null}
            <SheetFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCreateSheetOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCollectionMutation.isPending}
              >
                {createCollectionMutation.isPending
                  ? "Creating..."
                  : "Create Collection"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet
        open={isEditSheetOpen}
        onOpenChange={(open) => {
          setEditSheetOpen(open);
          if (!open) {
            setEditingCollectionId(null);
            setEditError(null);
          }
        }}
      >
        <SheetContent
          side="right"
          className="bg-surface-shell border-border-base"
        >
          <SheetHeader>
            <SheetTitle className="text-ink-primary">
              Edit Collection
            </SheetTitle>
            <SheetDescription>
              Update the collection name or description.
            </SheetDescription>
          </SheetHeader>
          <form className="mt-6 space-y-4" onSubmit={handleUpdateCollection}>
            <div className="space-y-1.5">
              <label className="text-xs text-ink-muted">Name</label>
              <Input
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                placeholder="e.g. React Helpers"
                className="bg-surface-default border-border-base"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-ink-muted">Description</label>
              <Textarea
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                placeholder="Short description for this collection..."
                className="bg-surface-default border-border-base"
                rows={4}
              />
            </div>
            {editError ? (
              <p className="text-sm text-red-400">{editError}</p>
            ) : null}
            <SheetFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditSheetOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateCollectionMutation.isPending}
              >
                {updateCollectionMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Floating Button */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 rounded-full bg-purple-600 hover:bg-purple-400 shadow-lg"
      >
        <Plus />
      </Button>
      {dialog}
    </div>
  );
}
