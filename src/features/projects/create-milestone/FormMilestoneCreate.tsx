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
import type { MilestoneStatus } from "@/src/entities/milestone/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateNewMilestoneMutation } from "@/src/entities/milestone/api/milestoneApi";

export type MilestoneFormValues = {
  title: string;
  description: string | null;
  status: MilestoneStatus;
};

type FormMilestoneCreateProps = {
  projectId: string;
  onRequestClose?: () => void;
  initialFocusRef?: React.RefObject<HTMLInputElement | null>;
};

const MILESTONE_STATUS_OPTIONS: {
  value: MilestoneStatus;
  label: string;
  id: string;
}[] = [
  { value: "todo", label: "В плане", id: "ms-todo" },
  { value: "in_progress", label: "В работе", id: "ms-in-progress" },
  { value: "review", label: "На ревью", id: "ms-review" },
  { value: "done", label: "Готово", id: "ms-done" },
];

const FormMilestoneCreate = ({
  projectId,
  onRequestClose,
  initialFocusRef,
}: FormMilestoneCreateProps) => {
  const [createMilestone, { isLoading, error }] =
    useCreateNewMilestoneMutation();

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<MilestoneStatus>("todo");
  const [description, setDescription] = useState("");

  const [titleError, setTitleError] = useState("");

  const apiErrorMessage = useMemo(() => {
    if (!error) return undefined;
    if (typeof error === "object" && error && "message" in error) {
      const msg = (error as { message?: unknown }).message;
      if (typeof msg === "string" && msg) return msg;
    }
    return "Не удалось сохранить задачу. Попробуйте ещё раз.";
  }, [error]);

  const canSubmit = !isLoading;

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const trimmed = title.trim();

    if (trimmed.length < 2) {
      setTitleError("Минимум 2 символа");
      return;
    }

    if (!canSubmit) return;

    try {
      await createMilestone({
        project_id: projectId,
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
            <FieldLabel htmlFor="milestone-title">Название</FieldLabel>
            <Input
              className="text-sm"
              id="milestone-title"
              type="text"
              ref={initialFocusRef}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError("");
              }}
              placeholder="Например: Вёрстка главной"
              aria-invalid={!!titleError}
            />
            <FieldError errors={titleError ? [{ message: titleError }] : []} />
          </Field>
          <Field>
            <FieldLabel htmlFor="milestone-desc">Описание</FieldLabel>
            <Input
              className="text-sm"
              id="milestone-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опционально"
            />
          </Field>
          <FieldLabel>Статус</FieldLabel>
          <RadioGroup
            value={status}
            className="grid grid-cols-2 gap-2"
            onValueChange={(value) => setStatus(value as MilestoneStatus)}
          >
            {MILESTONE_STATUS_OPTIONS.map(({ value, label, id }) => (
              <Field key={value} orientation="horizontal">
                <RadioGroupItem value={value} id={id} />
                <FieldLabel htmlFor={id} className="font-normal">
                  {label}
                </FieldLabel>
              </Field>
            ))}
          </RadioGroup>
          {apiErrorMessage && (
            <div className="text-sm text-destructive">{apiErrorMessage}</div>
          )}

          <Field orientation="horizontal" className="justify-end">
            <Button type="submit" disabled={!canSubmit}>
              {isLoading ? "Создание..." : "Создать задачу"}
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

export default FormMilestoneCreate;
