"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGetAgencyData } from "@/src/shared/hooks/api";
import {
  useGetAgencyInvitesQuery,
  useDeleteInviteMutation,
} from "@/src/entities/members/api/membersApi";
import { copyToClipboard } from "../lib/utils";
import LoadingInvites from "./LoadingInvites";
import EmptyInvites from "./EmptyInvites";
import InvitesList from "./InvitesList";

interface SentInvitesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SentInvitesModal = ({ open, onOpenChange }: SentInvitesModalProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInviteId, setSelectedInviteId] = useState<string | null>(null);
  const [Error, setError] = useState("");

  const { selectedAgencyId } = useGetAgencyData();
  const {
    data: invites,
    isLoading,
    error,
  } = useGetAgencyInvitesQuery(selectedAgencyId || "", {
    skip: !selectedAgencyId,
  });

  const [deleteInvite, { isLoading: isDeleting }] = useDeleteInviteMutation();

  const handleCopyLink = async (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    await copyToClipboard(link);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedInviteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInviteId) return;

    try {
      await deleteInvite(selectedInviteId).unwrap();
      setDeleteDialogOpen(false);
      setSelectedInviteId(null);
      setError("");
    } catch (error) {
      if (typeof error === "string") {
        setError(error);
      }
      setError("Не удалось отменить приглашение");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Отправленные приглашения</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <LoadingInvites />
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Не удалось загрузить приглашения
            </div>
          ) : !selectedAgencyId ? (
            <div className="text-center py-8 text-muted-foreground">
              Агентство не выбрано
            </div>
          ) : invites && invites.length === 0 ? (
            <EmptyInvites />
          ) : invites && invites.length > 0 ? (
            <>
              <InvitesList
                invites={invites}
                onCopyLink={handleCopyLink}
                onDeleteInvite={handleDeleteClick}
                isDeleting={isDeleting}
              />
              <span className="text-destructive">{Error}</span>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Отменить приглашение?</AlertDialogTitle>
          <AlertDialogDescription>
            Это действие нельзя отменить. Пользователь не сможет присоединиться
            по этой ссылке.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              Отменить
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SentInvitesModal;
