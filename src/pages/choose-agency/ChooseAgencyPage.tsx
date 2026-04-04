"use client";

import ChooseAgencyCard from "@/src/entities/profile/ui/ChooseAgencyCard";
import ChooseAgencyEmpty from "@/src/entities/profile/ui/ChooseAgencyEmpty";
import { useGetAgencyData } from "@/src/shared/hooks/api";
import Loading from "@/src/shared/ui/loading";

const ChooseAgencyPage = () => {
  const { agencies, isLoading } = useGetAgencyData();

  return (
    <div className="container h-[100vh]">
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
