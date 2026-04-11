import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldAlert } from "lucide-react";

const InviteErrorModal = () => {
  return (
    <Dialog defaultOpen>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2 text-destructive">
            <ShieldAlert className="size-5" />
            <DialogTitle>Приглашение недоступно</DialogTitle>
          </div>
          <DialogDescription>
            Это приглашение уже было использовано или срок его действия истек.
            Запросите новую ссылку у администратора команды.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button asChild className="w-full">
            <Link href="/agency">Вернуться на главную</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteErrorModal;
