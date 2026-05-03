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
import FormAgencyCreate from "./FormAgencyCreate";

interface CreateAgencyModalType {
  text: string;
  variant?:
    | "link"
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
    | null
    | undefined;
}

const CreateAgencyModal: React.FC<CreateAgencyModalType> = ({
  text = "Добавить команду",
  variant,
}) => {
  const [open, setOpen] = React.useState(false);
  const initialFocusRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <div className="w-full">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant={variant || "default"}
            size={"sm"}
            className={`${variant !== "outline" && "rounded-full"} w-full`}
          >
            {text}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            queueMicrotask(() => initialFocusRef.current?.focus());
          }}
        >
          <AlertDialogTitle>Создайте новую команду</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            Создание новой команды с указанным названием и ссылками на веб-сайт
            и логотип
          </AlertDialogDescription>
          <FormAgencyCreate
            key={open ? "project-form-open" : "project-form-closed"}
            onRequestClose={() => setOpen(false)}
            initialFocusRef={initialFocusRef}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CreateAgencyModal;
