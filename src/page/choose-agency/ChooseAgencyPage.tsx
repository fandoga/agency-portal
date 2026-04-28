"use client";

import ChooseAgencyCard from "@/src/widgets/agency-choose/AgencyChoose";
import ChooseAgencyEmpty from "@/src/widgets/agency-choose/ui/ChooseAgencyEmpty";
import { useGetAgencyData } from "@/src/shared/hooks/api";
import Loading from "@/src/shared/ui/loading";

const ChooseAgencyPage = () => {
  const { agencies, isLoading } = useGetAgencyData();

  return (
    <div className="px-4 pt-6 h-[100vh]">
      {isLoading ? (
        <Loading text="Подгружаем ваши профили" />
      ) : agencies.length > 0 ? (
        <ChooseAgencyCard />
      ) : (
        <ChooseAgencyEmpty />
      )}
    </div>
  );
};

export default ChooseAgencyPage;
