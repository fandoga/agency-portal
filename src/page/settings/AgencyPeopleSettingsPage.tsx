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

const AgencyPeopleSettingsPage = () => {
  const { selectedAgencyId, isLoading: isIdLoading } = useGetAgencyData();

  const {
    data,
    isLoading: isDataLoading,
    error,
  } = useGetAgencyMembersQuery(
    selectedAgencyId ? { agency_id: selectedAgencyId } : skipToken,
  );

  const roles = {
    owner: "Администратор",
    admin: "Менеджер",
    member: "Участник",
  };

  const isLoading = isIdLoading || isDataLoading;

  return (
    <div className="container max-w-2xl py-6">
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
                    className="border-0 shadow-none"
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
                  </Item>
                </React.Fragment>
              ))}
            </ItemGroup>
          </CardContent>
        )}
        <CardFooter className="flex-col items-stretch border-t pt-4">
          <AgencyInviteModal />
        </CardFooter>
      </Card>
    </div>
  );
};

export default AgencyPeopleSettingsPage;
