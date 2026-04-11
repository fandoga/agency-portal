import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import FormAgencyInvite from "./FormAgencyInvite";
import { UserPlus } from "lucide-react";
import MobileTooltip from "@/src/shared/ui/MobileTooltip";

const AgencyInviteModal = ({ disabled }: { disabled: boolean }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const initialFocusRef = React.useRef<HTMLButtonElement | null>(null);

  const inviteButton = (
    <Button
      disabled={disabled}
      variant="default"
      size="sm"
      className={`w-full gap-2 ${disabled ? "pointer-events-none" : ""}`}
    >
      <UserPlus className="size-4 shrink-0" />
      Пригласить новых участников
    </Button>
  );

  return (
    <div>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {disabled ? (
          <MobileTooltip text="У вас нет прав доступа. Попросите владельца агенства.">
            {inviteButton}
          </MobileTooltip>
        ) : (
          <AlertDialogTrigger asChild>{inviteButton}</AlertDialogTrigger>
        )}
        <AlertDialogContent
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            queueMicrotask(() => initialFocusRef.current?.focus());
          }}
        >
          <AlertDialogTitle>
            Пригласите человека в вашу команду
          </AlertDialogTitle>
          <AlertDialogDescription>
            Сгенерируйте ссылку на приглашение
          </AlertDialogDescription>
          <FormAgencyInvite
            key={dialogOpen ? "project-form-open" : "project-form-closed"}
            onRequestClose={() => setDialogOpen(false)}
            initialFocusRef={initialFocusRef}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AgencyInviteModal;
