"use client";

import React from "react";
import { Profile } from "@/src/entities/profile/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrganizationSettingsForm } from "@/src/features/organization-settings/ui/OrganizationSettingsForm";

interface OrganizationSettingsWidgetProps {
  agency: Profile;
}

export function OrganizationSettingsWidget({
  agency,
}: OrganizationSettingsWidgetProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1 px-4 sm:px-6">
        <h1 className="text-xl sm:text-2xl">Настройки организации</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Управление брендингом и идентичностью вашей организации
        </p>
      </CardHeader>
      <Separator />
      <CardContent className="px-4 sm:px-6">
        <OrganizationSettingsForm agency={agency} />
      </CardContent>
    </Card>
  );
}
