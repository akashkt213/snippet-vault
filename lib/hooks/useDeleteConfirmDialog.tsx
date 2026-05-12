"use client";

import { useCallback, useState } from "react";

import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

type DeleteConfirmRequest = {
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
};

export function useDeleteConfirmDialog(isPending: boolean) {
  const [request, setRequest] = useState<DeleteConfirmRequest | null>(null);

  const requestDelete = useCallback((next: DeleteConfirmRequest) => {
    setRequest(next);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (!isPending) {
      setRequest(null);
    }
  }, [isPending]);

  const dialog = (
    <DeleteConfirmDialog
      open={Boolean(request)}
      onOpenChange={(open) => {
        if (!open) {
          closeDeleteDialog();
        }
      }}
      title={request?.title ?? "Delete item?"}
      description={request?.description}
      confirmLabel={request?.confirmLabel}
      isPending={isPending}
      onConfirm={() => request?.onConfirm()}
    />
  );

  return { requestDelete, closeDeleteDialog, dialog };
}
