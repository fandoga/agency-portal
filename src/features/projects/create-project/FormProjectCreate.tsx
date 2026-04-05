"use client";

import React, { useMemo, useState } from "react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProjectStatus } from "@/src/entities/project/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateNewProjectMutation } from "@/src/entities/project/api/projectApi";
import { useGetAgencyData } from "@/src/shared/hooks/api";

export type ProjectEntityFormValues = {
  name: string;
  description: string | null;
  status: ProjectStatus;
};

type FormProjectCreateProps = {
  onRequestClose?: () => void;
  initialFocusRef?: React.RefObject<HTMLInputElement | null>;
};

const FormProjectCreate = ({
  onRequestClose,
  initialFocusRef,
}: FormProjectCreateProps) => {
  const [createNewProject, { isLoading, error }] =
    useCreateNewProjectMutation();

  const [name, setName] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("in_progress");
  const [description, setDescription] = useState("");
  const { selectedAgencyId } = useGetAgencyData();

  const [nameError, setNameError] = useState("");

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

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (trimmed.length < 2) {
      setNameError("Минимум 2 символа");
      return;
    }

    if (!canSubmit) return;
    if (!selectedAgencyId) return;

    try {
      await createNewProject({
        agency_id: selectedAgencyId,
        name: trimmed,
        description: description.trim() ? description.trim() : null,
        status,
      }).unwrap();
      onRequestClose?.();
    } catch {
      // Ошибка в `error` от RTK
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="w-full">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Название</FieldLabel>
            <Input
              className="text-sm"
              id="name"
              type="text"
              ref={initialFocusRef}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              placeholder="Редизайн лендинга"
              aria-invalid={!!nameError}
            />
            <FieldError errors={nameError ? [{ message: nameError }] : []} />
          </Field>
          <Field>
            <FieldLabel htmlFor="desc">Описание</FieldLabel>
            <Input
              className="text-sm"
              id="desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опционально. 1-2 предложения."
            />
          </Field>
          <FieldLabel htmlFor="desc">Выберите статус</FieldLabel>
          <RadioGroup
            value={status}
            className="grid grid-cols-2"
            onValueChange={(value) => setStatus(value as ProjectStatus)}
          >
            <Field orientation="horizontal">
              <RadioGroupItem value="in_progress" id="in-progress" />
              <FieldLabel htmlFor="in-progress" className="font-normal">
                В работе
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem value="paused" id="paused" />
              <FieldLabel htmlFor="paused" className="font-normal">
                На паузе
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem value="wait_review" id="wait_review" />
              <FieldLabel htmlFor="wait_review" className="font-normal">
                Ожидает ревью
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem value="completed" id="completed" />
              <FieldLabel htmlFor="completed" className="font-normal">
                Завершен
              </FieldLabel>
            </Field>
          </RadioGroup>
          {apiErrorMessage && (
            <div className="text-sm text-destructive">{apiErrorMessage}</div>
          )}

          <Field orientation="horizontal" className="justify-end">
            <Button type="submit" disabled={!canSubmit}>
              {isLoading ? "Создание..." : "Создать проект"}
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

export default FormProjectCreate;
