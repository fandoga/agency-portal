"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateMagicLink } from "../lib/generateMagicLink";
import { Spinner } from "@/components/ui/spinner";

interface ShareAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  shareToken: string;
}

export default function ShareAccessModal({
  open,
  onOpenChange,
  projectName,
  shareToken,
}: ShareAccessModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const result = await generateMagicLink({
      email,
      shareToken,
      projectName,
    });

    setIsLoading(false);

    if (result.success) {
      setMessage({
        type: "success",
        text: `Ссылка успешно отправлен на ${email}`,
      });
      setEmail("");

      // Закрываем модалку через 2 секунды
      setTimeout(() => {
        onOpenChange(false);
        setMessage(null);
      }, 2000);
    } else {
      setMessage({
        type: "error",
        text: result.error || "Произошла ошибка",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Поделиться доступом к проекту</DialogTitle>
          <DialogDescription>
            Отправьте клиенту ссылку для доступа к проекту {projectName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email клиента</Label>
            <Input
              id="email"
              type="email"
              placeholder="client@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Отправка...
                </>
              ) : (
                "Отправить"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-muted rounded-md text-sm text-muted-foreground">
          <p className="font-semibold mb-1">Как это работает:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Клиент получит email с ссылкой для входа</li>
            <li>При переходе по ссылке он автоматически авторизуется</li>
            <li>Клиент увидит только этот проект</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
