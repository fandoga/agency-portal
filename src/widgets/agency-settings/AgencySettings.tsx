"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Profile } from "@/src/entities/profile/lib/types";
import SettingsProfileBadge from "./ui/SettingsProfileBadge";

interface AgencySettingsType {
  session: Profile;
}

const AgencySettings: React.FC<AgencySettingsType> = ({ session }) => {
  return (
    <div className="size-full">
      <Card className="h-full" size="sm">
        <CardHeader>{session && <SettingsProfileBadge />}</CardHeader>
        <Separator className={` transition-all`} />
        <CardContent
          className={`flex h-full flex-col transition-all pt-4 gap-4`}
        >
          <Button size={"sm"} variant={"default"}>
            Настройки команды
          </Button>
          <Button size={"sm"} variant={"outline"}>
            Приложение
          </Button>
          <Button size={"sm"} variant={"outline"}>
            Другое
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencySettings;
