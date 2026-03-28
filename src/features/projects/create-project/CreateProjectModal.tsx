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
import FormProjectCreate from "./FormProjectCreate";

const CreateProjectModal = () => {
  const [open, setOpen] = React.useState(false);
  const initialFocusRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button size={"icon-lg"} className="rounded-full mt-2">
            <Plus className="size-6 cursor-pointer" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            queueMicrotask(() => initialFocusRef.current?.focus());
          }}
        >
          <AlertDialogTitle>Создайте новый проект</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            Создание нового проекта с указанным статусом, описанием и названием
          </AlertDialogDescription>
          <FormProjectCreate
            key={open ? "project-form-open" : "project-form-closed"}
            onRequestClose={() => setOpen(false)}
            initialFocusRef={initialFocusRef}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CreateProjectModal;
