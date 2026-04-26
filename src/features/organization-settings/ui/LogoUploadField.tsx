"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uploadLogo } from "../lib/uploadLogo";

interface LogoUploadFieldProps {
  onUploadComplete: (url: string) => void;
  onUploadError: (error: string) => void;
  disabled?: boolean;
  agencyId: string;
}

export function LogoUploadField({
  onUploadComplete,
  onUploadError,
  disabled = false,
  agencyId,
}: LogoUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 100);

    try {
      const result = await uploadLogo(file, agencyId);

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && result.url) {
        onUploadComplete(result.url);
        setError(null);
      } else {
        const errorMessage = result.error || "Ошибка загрузки файла";
        setError(errorMessage);
        onUploadError(errorMessage);
      }
    } catch (err) {
      clearInterval(progressInterval);
      const errorMessage =
        err instanceof Error ? err.message : "Ошибка загрузки файла";
      setError(errorMessage);
      onUploadError(errorMessage);
    } finally {
      setIsUploading(false);
      setProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
        aria-label="Выбрать файл логотипа"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        disabled={disabled || isUploading}
        aria-label="Загрузить логотип"
      >
        {isUploading ? "Загрузка..." : "Загрузить файл"}
      </Button>

      {isUploading && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Загрузка: {progress}%
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Поддерживаемые форматы: PNG, JPG, SVG, WEBP. Максимальный размер: 2MB
      </p>
    </div>
  );
}
