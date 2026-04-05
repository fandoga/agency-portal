"use client";

import React, { useMemo, useState } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateProfile } from "@/src/entities/profile/hooks/useCreateProfile";

export type ProjectEntityFormValues = {
  name: string;
  weburl?: string | null;
  logoUrl?: string | null;
};

type FormAgencyCreateProps = {
  onRequestClose?: () => void;
  initialFocusRef?: React.RefObject<HTMLInputElement | null>;
};

const FormAgencyCreate = ({
  onRequestClose,
  initialFocusRef,
}: FormAgencyCreateProps) => {
  const [createProfile, isLoading, error] = useCreateProfile();

  const [name, setName] = useState("");
  const [webUrl, setWebUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const [nameError, setNameError] = useState("");

  const apiErrorMessage = useMemo(() => {
    if (!error) return undefined;
    if (typeof error === "object" && error && "message" in error) {
      const msg = (error as { message?: unknown }).message;
      if (typeof msg === "string" && msg) return msg;
    }
    return "Не удалось создать команду. Попробуйте еще раз.";
  }, [error]);

  const canSubmit = !isLoading;

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (trimmed.length < 2) {
      setNameError("Минимум 2 символа");
      return;
    }

    if (!canSubmit) return;

    try {
      await createProfile({
        agency_name: trimmed,
        website_url: webUrl || "",
        logo_url: logoUrl || "",
      });
    } finally {
      onRequestClose?.();
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
              placeholder="Rockstar Games"
              aria-invalid={!!nameError}
            />
            <FieldError errors={nameError ? [{ message: nameError }] : []} />
          </Field>
          <Field>
            <FieldLabel htmlFor="web-url">Веб-сайт</FieldLabel>
            <Input
              className="text-sm"
              id="web-url"
              type="text"
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
              placeholder="rockstargames.com"
            />
            <FieldDescription>
              Опционально: Ссылка на сайт вашей огранизации
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="web-url">Логотип</FieldLabel>
            <Input
              className="text-sm"
              id="web-url"
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="rockstargames.com"
            />
            <FieldDescription>
              Опционально: Загрузите логотип вашей огранизации
            </FieldDescription>
          </Field>
          {apiErrorMessage && (
            <div className="text-sm text-destructive">{apiErrorMessage}</div>
          )}

          <Field orientation="horizontal" className="justify-between">
            <Button className="flex-1" type="submit" disabled={!canSubmit}>
              {isLoading ? "Создание..." : "Создать команду"}
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

export default FormAgencyCreate;
