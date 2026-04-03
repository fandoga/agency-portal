"use client";

import { useGetAgencyQuery } from "@/src/entities/profile/api/profileApi";
import Loader from "@/src/shared/components/Loader";
import AgencySettings from "@/src/widgets/agency-settings/AgencySettings";
import { useSearchParams } from "next/navigation";

const SettingsPage = () => {
  const { data, isLoading } = useGetAgencyQuery();

  const searchParams = useSearchParams();

  const session = data?.filter(
    (ag) => ag.id === searchParams?.get("agency_id"),
  )[0];

  const otherAgency = data?.filter(
    (ag) => ag.id !== searchParams?.get("agency_id"),
  );

  return (
    <div className="container">
      {isLoading || !session ? (
        <Loader text={"Загружаем ваш профиль"} />
      ) : (
        <AgencySettings session={session} otherAgency={otherAgency} />
      )}
    </div>
  );
};

export default SettingsPage;
