"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Profile } from "@/src/entities/profile/lib/types";
import { useUpdateOrganizationSettingsMutation } from "@/src/entities/profile/api/profileApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoUploadField } from "./LogoUploadField";
import {
  validateAgencyName,
  validateColorTheme,
  validateLogoUrl,
} from "../lib/validation";
import MobileTooltip from "@/src/shared/ui/MobileTooltip";
import { CircleQuestionMark } from "lucide-react";

interface OrganizationSettingsFormProps {
  agency: Profile;
}

interface FormErrors {
  agency_name?: string;
  color_theme?: string;
  logo_url?: string;
  _form?: string;
}

export function OrganizationSettingsForm({
  agency,
}: OrganizationSettingsFormProps) {
  const [agencyName, setAgencyName] = useState(agency.agency_name);
  const [colorTheme, setColorTheme] = useState(agency.color_theme || "");
  const [logoUrl, setLogoUrl] = useState(agency.logo_url || "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [updateSettings, { isLoading }] =
    useUpdateOrganizationSettingsMutation();

  const agencyNameRef = useRef<HTMLInputElement>(null);
  const colorThemeRef = useRef<HTMLInputElement>(null);
  const logoUrlRef = useRef<HTMLInputElement>(null);

  // Validate single field
  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case "agency_name":
        return validateAgencyName(value);
      case "color_theme":
        return validateColorTheme(value);
      case "logo_url":
        return validateLogoUrl(value);
      default:
        return null;
    }
  };

  // Handle field change with validation
  const handleFieldChange = (field: string, value: string) => {
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error || undefined }));

    switch (field) {
      case "agency_name":
        setAgencyName(value);
        break;
      case "color_theme":
        setColorTheme(value);
        break;
      case "logo_url":
        setLogoUrl(value);
        break;
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const nameError = validateAgencyName(agencyName);
    if (nameError) newErrors.agency_name = nameError;

    const colorError = validateColorTheme(colorTheme);
    if (colorError) newErrors.color_theme = colorError;

    const urlError = validateLogoUrl(logoUrl);
    if (urlError) newErrors.logo_url = urlError;

    setErrors(newErrors);

    // Focus first error field
    if (newErrors.agency_name) {
      agencyNameRef.current?.focus();
    } else if (newErrors.color_theme) {
      colorThemeRef.current?.focus();
    } else if (newErrors.logo_url) {
      logoUrlRef.current?.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      await updateSettings({
        profileId: agency.id,
        agency_name: agencyName,
        color_theme: colorTheme || null,
        logo_url: logoUrl,
      }).unwrap();

      setSuccessMessage("Настройки успешно сохранены");
      setErrors({});

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : error && typeof error === "object" && "data" in error
            ? String(
                (error.data as { message?: string })?.message ||
                  "Ошибка при сохранении настроек",
              )
            : "Ошибка при сохранении настроек";

      // Check for RLS permission error
      const errorCode =
        error && typeof error === "object" && "code" in error
          ? error.code
          : null;
      if (errorCode === "42501" || errorMessage.includes("permission denied")) {
        setErrors({
          _form:
            "Недостаточно прав для изменения настроек организации. Только владелец может изменять настройки.",
        });
      } else {
        setErrors({ _form: errorMessage });
      }
    }
  };

  // Handle logo upload complete
  const handleUploadComplete = (url: string) => {
    setLogoUrl(url);
    setErrors((prev) => ({ ...prev, logo_url: undefined }));
  };

  // Handle logo upload error
  const handleUploadError = (error: string) => {
    setErrors((prev) => ({ ...prev, logo_url: error }));
  };

  const hasErrors = Object.values(errors).some((error) => error !== undefined);
  const isSubmitDisabled = isLoading || hasErrors;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Agency Name Field */}
      <div className="space-y-2">
        <Label htmlFor="agency_name" className="text-sm sm:text-base">
          Название организации <span className="text-destructive">*</span>
        </Label>
        <Input
          ref={agencyNameRef}
          id="agency_name"
          type="text"
          value={agencyName}
          onChange={(e) => handleFieldChange("agency_name", e.target.value)}
          onBlur={(e) => handleFieldChange("agency_name", e.target.value)}
          disabled={isLoading}
          aria-invalid={!!errors.agency_name}
          aria-describedby={
            errors.agency_name ? "agency_name-error" : undefined
          }
        />
        {errors.agency_name && (
          <p
            id="agency_name-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.agency_name}
          </p>
        )}
      </div>

      {/* Color Theme Field */}
      <div className="space-y-2">
        <Label htmlFor="color_theme" className="text-sm sm:text-base">
          Цветовая тема
          <MobileTooltip text="Если у вашей организации есть своя стилистика, вы можете использовать ее. Этот цвет интерфейса увидит клиент.">
            <CircleQuestionMark size={17} className="opacity-60" />
          </MobileTooltip>
        </Label>

        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <Input
            ref={colorThemeRef}
            id="color_theme"
            type="color"
            value={colorTheme || "#000000"}
            onChange={(e) => handleFieldChange("color_theme", e.target.value)}
            disabled={isLoading}
            className="w-18 h-12 cursor-pointer"
            aria-invalid={!!errors.color_theme}
            aria-describedby={
              errors.color_theme ? "color_theme-error" : undefined
            }
            aria-label="Выбрать цвет темы"
          />
        </div>
        {errors.color_theme && (
          <p
            id="color_theme-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.color_theme}
          </p>
        )}
      </div>

      {/* Logo Field */}
      <div className="space-y-2">
        <Label className="text-sm sm:text-base">Загрузите ваш логотип</Label>
        {/* Logo Preview */}
        {logoUrl && !errors.logo_url && (
          <div className="mt-2 relative rounded-full overflow-hidden w-32 h-32">
            <Image
              src={logoUrl}
              alt="Предпросмотр логотипа"
              fill
              className="object-cover rounded-full bg-border"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EЛоготип%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <LogoUploadField
          agencyId={agency.id}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          disabled={isLoading}
        />
      </div>

      {/* Form Error */}
      {errors._form && (
        <div
          className="p-3 rounded bg-destructive/10 text-destructive text-sm"
          role="alert"
          aria-live="assertive"
        >
          {errors._form}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div
          className="p-3 rounded bg-green-50 text-green-700 text-sm"
          role="status"
          aria-live="polite"
        >
          {successMessage}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitDisabled}
        className="w-full text-sm sm:text-base"
      >
        {isLoading ? "Сохранение..." : "Сохранить изменения"}
      </Button>
    </form>
  );
}
