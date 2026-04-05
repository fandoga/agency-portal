"use client";
import Loading from "@/src/shared/ui/loading";
import { useGetAgencyData } from "@/src/shared/hooks/api";
import AgencySettings from "@/src/widgets/agency-settings/AgencySettings";

const SettingsPage = () => {
  const { session, isLoading } = useGetAgencyData();

  return (
    <div className="container">
      {!session || isLoading ? (
        <Loading text={"Загружаем ваш профиль"} />
      ) : (
        <AgencySettings session={session} />
      )}
    </div>
  );
};

export default SettingsPage;
