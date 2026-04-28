"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Profile } from "@/src/entities/profile/lib/types";
import SettingsProfileBadge from "./ui/SettingsProfileBadge";
import { useRedirectParams } from "@/src/shared/hooks/useRedirectParams";

interface AgencySettingsType {
  session: Profile;
}

const AgencySettings: React.FC<AgencySettingsType> = ({ session }) => {
  const redirectParams = useRedirectParams();

  return (
    <div className="w-full">
      <Card className="h-full" size="sm">
        <CardHeader>{session && <SettingsProfileBadge />}</CardHeader>
        <Separator className={` transition-all`} />
        <CardContent
          className={`flex h-full flex-col transition-all pt-4 gap-3`}
        >
          <Button
            onClick={() => redirectParams("/settings/agency-settings")}
            size={"sm"}
          >
            Настройки команды
          </Button>
          <Button
            onClick={() => redirectParams("/settings/organization-settings")}
            size={"sm"}
            variant={"outline"}
          >
            Настройки организации
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencySettings;
