"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import FormMilestoneCreate from "./FormMilestoneCreate";

type CreateMilestoneModalProps = {
  projectId: string;
  trigger?: React.ReactNode;
};

const CreateMilestoneModal = ({
  projectId,
  trigger,
}: CreateMilestoneModalProps) => {
  const [open, setOpen] = React.useState(false);
  const initialFocusRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button size="icon-lg" className="rounded-full mt-2" type="button">
            <Plus className="size-6 cursor-pointer" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          queueMicrotask(() => initialFocusRef.current?.focus());
        }}
      >
        <AlertDialogTitle>Новая задача</AlertDialogTitle>
        <AlertDialogDescription className="sr-only">
          Создание задачи: название, описание и статус
        </AlertDialogDescription>
        <FormMilestoneCreate
          key={open ? "milestone-open" : "milestone-closed"}
          projectId={projectId}
          onRequestClose={() => setOpen(false)}
          initialFocusRef={initialFocusRef}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreateMilestoneModal;
