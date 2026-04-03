import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ProfileBadge from "@/src/entities/profile/ui/ProfileBadge";
import { Separator } from "@/components/ui/separator";
import { Profile } from "@/src/entities/profile/lib/types";

interface AgencySettingsType {
  session: Profile;
  otherAgency: Profile[] | undefined;
}

const AgencySettings: React.FC<AgencySettingsType> = ({
  session,
  otherAgency,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="size-full">
      <Card className="h-full" size="sm">
        <CardHeader>
          {session && (
            <div className="relative" onClick={() => setOpen((prev) => !prev)}>
              <ProfileBadge
                logo={session?.logo_url}
                name={session?.agency_name}
              />
              <div
                className={`mt-2 border-1 border-border pb-4 gap-4 flex flex-col items-center px-2 overflow-hidden w-full ${open ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 h-0"} bg-muted transition-all rounded-[38px]`}
              >
                {otherAgency?.map((ag) => (
                  <div className="mt-4" key={ag.id}>
                    <ProfileBadge
                      hasDrodown={false}
                      logo={ag?.logo_url}
                      name={ag?.agency_name}
                    />
                  </div>
                ))}
                <Button
                  className="border-1 border-ring"
                  variant={"secondary"}
                  size={"sm"}
                >
                  Создать команду
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
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
