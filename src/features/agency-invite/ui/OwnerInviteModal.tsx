import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type OwnerInviteModalProps = {
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
};

const OwnerInviteModal = ({
  onConfirm,
  disabled = false,
}: OwnerInviteModalProps) => {
  const [isClicked, setClicked] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          {isClicked ? "Создание..." : "Сгенерировать"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="!text-xl">Вы уверены?</DialogTitle>
          <DialogDescription>
            Вы создаете приглашение для администратора. Любой кто пройдет по
            ссылке получить полный доступ к команде, проектам и участникам.
            Будьте внимательны!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              onClick={() => {
                setClicked(true);
                onConfirm();
              }}
              variant="outline"
              disabled={disabled}
            >
              Да, сгенерировать
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button">Отмена</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OwnerInviteModal;
