"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import {
  applyAgencyTheme,
  resetAgencyTheme,
} from "@/src/shared/lib/theme/applyAgencyTheme";

interface ClientLayoutProps {
  children: React.ReactNode;
  agency?: {
    agency_name: string;
    logo_url?: string | null;
    color_theme?: string | null;
  } | null;
}

export default function ClientLayout({ children, agency }: ClientLayoutProps) {
  // Применяем тему агентства при монтировании
  useEffect(() => {
    if (agency?.color_theme) {
      applyAgencyTheme(agency.color_theme);
    }

    // Сбрасываем тему при размонтировании
    return () => {
      resetAgencyTheme();
    };
  }, [agency?.color_theme]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header с логотипом агентства */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="px-4 py-4 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Логотип или название агентства */}
            {agency?.logo_url ? (
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={agency.logo_url}
                    alt={agency.agency_name}
                    fill
                    className="object-cover bg-border"
                  />
                </div>
                <span className="text-lg font-semibold">
                  {agency.agency_name}
                </span>
              </div>
            ) : (
              <h1 className="text-lg font-semibold">
                {agency?.agency_name || "Клиентский портал"}
              </h1>
            )}
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="px-4 py-6 max-w-5xl mx-auto">
          <p className="text-sm text-muted-foreground text-center">
            {agency?.agency_name &&
              `© ${new Date().getFullYear()} ${agency.agency_name}`}
          </p>
        </div>
      </footer>
    </div>
  );
}
