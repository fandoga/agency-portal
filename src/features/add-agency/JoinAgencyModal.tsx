import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import React, { useState } from "react";

const JoinAgencyModal = ({ text }: { text: string }) => {
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = useState("");
  const [inputError, setInputError] = useState("");

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="w-full rounded-full" variant="outline" size={"sm"}>
          {text}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Вступите в команду</AlertDialogTitle>
        <AlertDialogDescription>
          Введите ссылку приглашения и если она существует, вы автоматические
          подключитесь к нужной команде
        </AlertDialogDescription>
        <Separator />
        <Input
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Ссылка на приглашение"
        ></Input>
        {inputError.length > 0 && (
          <p className="text-destructive">{inputError}</p>
        )}

        <Button
          className="border-1 border-brand-300"
          variant={"link"}
          onClick={() => {
            if (url.startsWith("http")) {
              setInputError("");
              redirect(url);
            } else {
              setInputError("Ссылка некоректна");
            }
          }}
        >
          Вступить
        </Button>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default JoinAgencyModal;
