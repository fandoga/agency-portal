import React from "react";
import { useGetAgencyQuery } from "../api/profileApi";
import { redirect, useSearchParams } from "next/navigation";
import ProfileBadge from "./ProfileBadge";

const AgencyList = () => {
  const { data } = useGetAgencyQuery();

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
    <div className="flex flex-col gap-4 pt-4">
      {data?.map((ag) => (
        <div onClick={() => handleAgencyClick(ag.id)} key={ag.id}>
          <ProfileBadge
            logo={ag.logo_url}
            name={ag.agency_name}
            onProfilePage={false}
          />
        </div>
      ))}
    </div>
  );
};

export default AgencyList;
