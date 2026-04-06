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

const AgencyInviteModal = () => {
  const [open, setOpen] = useState(false);
  const initialFocusRef = React.useRef<HTMLButtonElement | null>(null);

  return (
    <div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="default" size="sm" className="w-full gap-2">
            <UserPlus className="size-4 shrink-0" />
            Пригласить новых участников
          </Button>
        </AlertDialogTrigger>
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
            key={open ? "project-form-open" : "project-form-closed"}
            onRequestClose={() => setOpen(false)}
            initialFocusRef={initialFocusRef}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AgencyInviteModal;
