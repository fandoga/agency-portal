import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import React, { useState } from "react";
import AgencyInviteModal from "@/src/features/agency-invite/ui/AgencyInviteModal";
import SentInvitesModal from "@/src/features/sent-invites-modal/ui/SentInvitesModal";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { CircleUserRound } from "lucide-react";

import { useGetUsersData } from "@/src/shared/hooks/api";
import MobileTooltip from "@/src/shared/ui/MobileTooltip";

const AgencyPeopleSettings = () => {
  const [sentInvitesOpen, setSentInvitesOpen] = useState(false);
  const { currentUser, isLoading, agencyMembers } = useGetUsersData();

  const notAllowed = currentUser?.role !== "owner";

  const roles = {
    owner: "Администратор",
    admin: "Менеджер",
    member: "Участник",
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card size="sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="!text-xl">Настройки команды</CardTitle>
          <CardDescription>
            Участники с доступом к рабочему пространству агентства
          </CardDescription>
        </CardHeader>
        {isLoading ? (
          <div className="w-full ml-[47%]">
            <Spinner className="scale-140" />
          </div>
        ) : (
          <CardContent
            className={`pt-4 ${isLoading ? "opacity-0" : "opacity-100"} `}
          >
            <CardTitle className="mb-3 text-sm font-medium ">
              Участники
            </CardTitle>
            <ItemGroup className="gap-0 rounded-lg border border-border bg-muted/30 p-1">
              {agencyMembers?.map((member, index) => (
                <React.Fragment key={member.user_id}>
                  {index > 0 ? <ItemSeparator className="my-0" /> : null}
                  <Item
                    size="sm"
                    variant="default"
                    className="border-0 shadow-none relative"
                  >
                    <ItemMedia className="pr-3">
                      <Avatar size="sm">
                        <AvatarFallback className="text-xs">SN</AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent className="min-w-0 gap-1">
                      <div className="flex flex-col items-start gap-2">
                        <ItemTitle className="text-foreground">
                          {member.email}
                        </ItemTitle>
                        <Badge variant="outline">{roles[member.role]}</Badge>
                      </div>
                    </ItemContent>
                    {currentUser?.user_id === member.user_id && (
                      <MobileTooltip text="Это вы">
                        <div
                          style={{ color: "var(--brand-300)" }}
                          className="flex flex-row items-center gap-1"
                        >
                          <CircleUserRound size={18} />
                        </div>
                      </MobileTooltip>
                    )}
                  </Item>
                </React.Fragment>
              ))}
            </ItemGroup>
          </CardContent>
        )}
        <CardFooter className="flex-col items-stretch border-t pt-4">
          <AgencyInviteModal disabled={notAllowed} />
          <Button
            size="sm"
            className="w-full mt-2"
            variant={"outline"}
            onClick={() => setSentInvitesOpen(true)}
          >
            Отправленные приглашения
          </Button>
        </CardFooter>
      </Card>

      <SentInvitesModal
        open={sentInvitesOpen}
        onOpenChange={setSentInvitesOpen}
      />
    </div>
  );
};

export default AgencyPeopleSettings;
