"use client";

import React from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/src/shared/providers/authProvider";
import { useGetAgencyData, useGetUsersData } from "@/src/shared/hooks/api";
import { useRedirectParams } from "@/src/shared/hooks/useRedirectParams";
import { OrganizationSettingsWidget } from "@/src/widgets/agency-settings/organization-settings/OrganizationSettingsWidget";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loading from "@/src/shared/ui/loading";
import { roles } from "@/src/widgets/agency-invites/AgencyInviteCard";

export function SettingsOrgPage() {
  const { session: authSession } = useAuth();
  const { session: agency, isLoading: isLoadingAgency } = useGetAgencyData();
  const { currentUser, isLoading: isLoadingUser } = useGetUsersData();
  const redirectParams = useRedirectParams();

  // Authentication guard
  if (!authSession) {
    redirect("/auth");
  }

  // Loading state
  if (isLoadingAgency || isLoadingUser) {
    return <Loading text="Загружаем настройки организации" />;
  }

  // Authorization guard - only owners can access
  const isOwner = currentUser?.role === "owner";

  if (!isOwner) {
    return (
      <div className="container">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <h2 className="text-xl font-bold">Доступ запрещён</h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Только владелец организации может изменять настройки. Ваша роль:{" "}
              <strong>
                {currentUser?.role ? roles[currentUser?.role] : "не определена"}
              </strong>
            </p>
            <Button onClick={() => redirectParams("/agency")}>
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!agency) return;

  // Render settings widget for authorized owners
  return (
    <div className="container">
      <OrganizationSettingsWidget agency={agency} />
    </div>
  );
}
