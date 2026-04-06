"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGetAgencyData } from "@/src/shared/hooks/api";
import { Role } from "@/src/entities/members/lib/types";
import { useCreateNewInviteMutation } from "@/src/entities/members/api/membersApi";
import { Item } from "@/components/ui/item";
import { QueryStatus } from "@reduxjs/toolkit/query";
import OwnerInviteModal from "./OwnerInviteModal";

type PendingPayload = {
  agency_id: string;
  role: Role;
};

type FormAgencyInviteProps = {
  onRequestClose?: () => void;
  initialFocusRef?: React.RefObject<HTMLButtonElement | null>;
};

const FormAgencyInvite = ({
  onRequestClose,
  initialFocusRef,
}: FormAgencyInviteProps) => {
  const [createNewInvite, { isLoading, error, status }] =
    useCreateNewInviteMutation();

  const [token, setToken] = useState<string>();
  const [pendingPayload, setPendingPayload] = useState<PendingPayload | null>(
    null,
  );

  const [role, setRole] = useState<Role>("member");
  const baseInviteURL = "http://localhost:3000/invite/";
  const inviteUrl = token ? baseInviteURL + token : "";

  const { selectedAgencyId } = useGetAgencyData();

  const apiErrorMessage = useMemo(() => {
    if (!error) return undefined;
    if (typeof error === "object" && error && "message" in error) {
      const msg = (error as { message?: unknown }).message;
      if (typeof msg === "string" && msg) return msg;
    }

    if (!selectedAgencyId) {
      return "Не удалось получить данные о сессии. Попробуйте еще раз.";
    }
    return "Не удалось создать проект. Попробуйте еще раз.";
  }, [error, selectedAgencyId]);

  const [isCopied, setIsCopied] = useState(false);
  const isSuccess = status === QueryStatus.fulfilled;
  const isError = status === QueryStatus.rejected;
  const cantSubmit = isLoading || isCopied;

  const submitInviteRequest = () => {
    if (cantSubmit) return;
    if (!selectedAgencyId) return;

    const newToken = crypto.randomUUID();
    setPendingPayload({
      agency_id: selectedAgencyId,
      role,
    });
    setToken(newToken);
  };

  const copyInviteUrl = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setIsCopied(true);
    } catch {
      // noop
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (role === "owner") return;
    if (isSuccess) {
      await copyInviteUrl();
      return;
    }
    submitInviteRequest();
  };

  const handlePrimaryAction = async () => {
    if (isSuccess) {
      await copyInviteUrl();
      return;
    }
    submitInviteRequest();
  };

  useEffect(() => {
    if (!token) return;
    if (!pendingPayload) return;
    let cancelled = false;
    const run = async () => {
      try {
        await createNewInvite({
          ...pendingPayload,
          token,
        }).unwrap();
      } catch {
        //e
      } finally {
        if (cancelled) return;

        setPendingPayload(null);
      }
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [token, pendingPayload, createNewInvite]);

  return (
    <div>
      <form onSubmit={handleSubmit} className="w-full">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="role">Роль</FieldLabel>
            <Select onValueChange={(e: Role) => setRole(e)}>
              <SelectTrigger ref={initialFocusRef} className="w-full">
                <SelectValue placeholder="Выберите роль участника" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="owner">Администратор</SelectItem>
                  <SelectItem value="admin">Менеджер</SelectItem>
                  <SelectItem value="member">Участник</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          {token && token.length > 0 && !apiErrorMessage && (
            <Item className="border-border">
              <p className="text-muted-foreground">
                {(baseInviteURL + token).slice(0, 35) + "..."}
              </p>
            </Item>
          )}
          {apiErrorMessage && (
            <div className="text-sm text-destructive">{apiErrorMessage}</div>
          )}

          <Field orientation="horizontal" className="justify-end">
            {role === "owner" && !isSuccess ? (
              <OwnerInviteModal
                onConfirm={handlePrimaryAction}
                disabled={cantSubmit}
              />
            ) : (
              <Button
                onClick={handlePrimaryAction}
                type="submit"
                disabled={cantSubmit}
              >
                {isLoading
                  ? "Создание..."
                  : isSuccess
                    ? isCopied
                      ? "Скопировано"
                      : "Скопировать"
                    : isError
                      ? "Повторить"
                      : "Сгенерировать"}
              </Button>
            )}
            <Button
              variant="outline"
              type="button"
              onClick={onRequestClose}
              disabled={isLoading}
            >
              Отмена
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
};

export default FormAgencyInvite;
