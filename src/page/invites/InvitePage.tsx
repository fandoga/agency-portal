"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import {
  useCreateAgencyMemberMutation,
  useGetInviteByTokenQuery,
} from "@/src/entities/members/api/membersApi";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/src/shared/providers/authProvider";
import { redirect } from "next/navigation";

const InvitePage = ({ token }: { token: string }) => {
  const { data } = useGetInviteByTokenQuery({ token });
  const [createAgencyMember, { isLoading: isAcceptLoading }] =
    useCreateAgencyMemberMutation();
  const [accepted, setAccepted] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const { session } = useAuth();

  const invite = data?.[0];

  const inviteCode = token.slice(0, 8).toUpperCase();

  useEffect(() => {
    if (invite?.status === "accepted") {
      redirect("/auth/choose-agency");
    }
  }, [invite, invite?.status]);

  const roles = {
    owner: "Администратора",
    admin: "Менеджера",
    member: "Участника",
  };

  if (!invite) return null;

  const handleAccept = async () => {
    if (!session?.user?.id) {
      setAcceptError("Сначала войдите в аккаунт, чтобы принять приглашение.");
      return;
    }

    setAcceptError(null);
    try {
      await createAgencyMember({
        user_id: session.user.id,
        role: invite.role,
        token: token,
      }).unwrap();
      setAccepted(true);
    } catch {
      setAcceptError("Не удалось принять приглашение. Попробуйте еще раз.");
    }
  };

  return (
    <div className="container h-[80vh] flex flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-md">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="space-y-4 pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-12 border">
                <AvatarFallback className="text-sm font-semibold">
                  AG
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">
                  Приглашение в команду
                </p>
                <CardTitle className="text-xl">{invite?.agency_name}</CardTitle>
              </div>
            </div>
            <div className="flex items-center px-1 gap-2">
              <p className="text-xs text-muted-foreground">на роль</p>
              <Badge variant={"outline"}>{roles[invite.role]}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-foreground/90">
              Вас приглашает агентство{" "}
              <span className="font-semibold">{invite?.agency_name}</span>.
              После принятия вы получите доступ к проектам и участникам команды.
            </p>

            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Код приглашения</p>
              <p className="mt-1 font-mono text-sm">{inviteCode}</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldAlert className="size-4" />
              Принимайте приглашение только от знакомой команды.
            </div>
          </CardContent>

          <CardFooter className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="w-full">
              Отклонить
            </Button>
            <Button
              className="w-full gap-2"
              onClick={handleAccept}
              disabled={isAcceptLoading || accepted}
            >
              <BadgeCheck className="size-4" />
              {isAcceptLoading
                ? "Принятие..."
                : accepted
                  ? "Принято"
                  : "Принять"}
            </Button>
          </CardFooter>
          {acceptError && (
            <p className="px-6 pb-5 text-sm text-destructive">{acceptError}</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default InvitePage;
