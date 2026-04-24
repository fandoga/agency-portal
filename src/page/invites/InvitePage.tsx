"use client";

import React from "react";

import { useGetInviteByTokenQuery } from "@/src/entities/members/api/membersApi";

import Loading from "@/src/shared/ui/loading";
import AgencyInviteCard from "@/src/widgets/agency-invites/AgencyInviteCard";

const InvitePage = ({ token }: { token: string }) => {
  const { data, isLoading } = useGetInviteByTokenQuery({ token });

  return (
    <div className="container h-[90vh] flex flex-col items-center justify-center">
      {isLoading ? (
        <Loading text="Загружем приглашение" />
      ) : (
        <AgencyInviteCard data={data} token={token} />
      )}
    </div>
  );
};

export default InvitePage;
