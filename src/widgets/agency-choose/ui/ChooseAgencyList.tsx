"use client";

import React from "react";
import { redirect, useSearchParams } from "next/navigation";
import ProfileBadge from "../../../entities/profile/ui/ProfileBadge";
import { Profile } from "../../../entities/profile/lib/types";
import { useGetAgencyData } from "@/src/shared/hooks/api";

const ChooseAgencyList = () => {
  const { agencies } = useGetAgencyData();

  const searchParams = useSearchParams();

  const handleAgencyClick = (term: string) => {
    // Создаем изменяемый объект на основе текущих параметров
    const params = new URLSearchParams(searchParams ?? "");

    if (term) {
      params.set("agency_id", term);
    } else {
      params.delete("agency_id");
    }

    redirect(`/agency?${params.toString()}`);
  };

  return (
    <div className="w-full flex flex-col items-center pt-4">
      <div className="size-full">
        {agencies?.map((ag: Profile) => (
          <div
            className="pb-4"
            onClick={() => handleAgencyClick(ag.id)}
            key={ag.id}
          >
            <ProfileBadge
              logo={ag.logo_url}
              name={ag.agency_name}
              hasDrodown={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChooseAgencyList;
