"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetAgencyQuery } from "@/src/entities/profile/api/profileApi";
import ProfileBadge from "@/src/entities/profile/ui/ProfileBadge";
import { useState } from "react";

const SettingsPage = () => {
  const { data } = useGetAgencyQuery();
  const [open, setOpen] = useState(false);

  const session = data?.[0];

  return (
    <div className="container">
      <Card className="h-full" size="sm">
        <CardHeader>
          {session && (
            <div onClick={() => setOpen((prev) => !prev)}>
              <ProfileBadge
                logo={session?.logo_url}
                name={session?.agency_name}
              />
            </div>
          )}
        </CardHeader>
        <Separator className={`${open ? "mt-80" : "mt-0"} transition-all`} />
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

export default SettingsPage;
