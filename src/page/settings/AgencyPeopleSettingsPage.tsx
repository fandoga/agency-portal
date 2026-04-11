"use client";

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
import React from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import AgencyInviteModal from "@/src/features/agency-invite/ui/AgencyInviteModal";
import { useGetAgencyMembersQuery } from "@/src/entities/members/api/membersApi";
import { useGetAgencyData } from "@/src/shared/hooks/api";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useRedirectParams } from "@/src/shared/hooks/useRedirectParams";
import { useAuth } from "@/src/shared/providers/authProvider";
import { CircleUserRound } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSearchParams } from "next/navigation";

const AgencyPeopleSettingsPage = () => {
  const { selectedAgencyId, isLoading: isIdLoading } = useGetAgencyData();
  const refirectParams = useRedirectParams();
  const searchParams = useSearchParams();

  const { data, isLoading: isDataLoading } = useGetAgencyMembersQuery(
    selectedAgencyId ? { agency_id: selectedAgencyId } : skipToken,
  );

  const handleChangeAgency = (id: string) => {
    const params = new URLSearchParams(searchParams ?? "");
    // отчищаем старый id
    params.delete("agency_id");
    // добавляем новый id
    params.set("agency_id", id);
  };

  const { session } = useAuth();

  const roles = {
    owner: "Администратор",
    admin: "Менеджер",
    member: "Участник",
  };

  const isLoading = isIdLoading || isDataLoading;

  return (
    <div className="container max-w-2xl">
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
              {data?.map((member, index) => (
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
                    {session?.user?.id === member.user_id && (
                      <Tooltip>
                        <TooltipTrigger>
                          <div
                            style={{ color: "var(--brand-300)" }}
                            className="flex flex-row items-center gap-1"
                          >
                            <CircleUserRound size={18} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Это вы</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </Item>
                </React.Fragment>
              ))}
            </ItemGroup>
          </CardContent>
        )}
        <CardFooter className="flex-col items-stretch border-t pt-4">
          <AgencyInviteModal />
          <Button
            size="sm"
            className="w-full mt-2"
            variant={"outline"}
            onClick={() => {
              refirectParams("setttings/agency-settings/invites");
            }}
          >
            Отправленные приглашения
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AgencyPeopleSettingsPage;
