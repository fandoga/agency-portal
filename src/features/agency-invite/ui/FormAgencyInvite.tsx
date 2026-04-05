"use client";

import React, { useMemo, useState } from "react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ProjectStatus } from "@/src/entities/project/lib/types";
import { useCreateNewProjectMutation } from "@/src/entities/project/api/projectApi";
import { useGetAgencyData } from "@/src/shared/hooks/api";
import { Role } from "@/src/entities/members/lib/types";

export type ProjectEntityFormValues = {
  name: string;
  description: string | null;
  status: ProjectStatus;
};

type FormAgencyInviteProps = {
  onRequestClose?: () => void;
  initialFocusRef?: React.RefObject<HTMLInputElement | null>;
};

const FormAgencyInvite = ({
  onRequestClose,
  initialFocusRef,
}: FormAgencyInviteProps) => {
  const [createNewProject, { isLoading, error }] =
    useCreateNewProjectMutation();

  const [role, setRole] = useState<Role>("member");

  console.log(role);

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

  const canSubmit = !isLoading;

  const handleCreate = () => {};

  return (
    <div>
      <form onSubmit={handleCreate} className="w-full">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="role">Роль</FieldLabel>
            <Select onValueChange={(e: Role) => setRole(e)}>
              <SelectTrigger className="w-full">
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
          {apiErrorMessage && (
            <div className="text-sm text-destructive">{apiErrorMessage}</div>
          )}

          <Field orientation="horizontal" className="justify-end">
            <Button type="submit" disabled={!canSubmit}>
              {isLoading ? "Создание..." : "Сгенерировать"}
            </Button>
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
