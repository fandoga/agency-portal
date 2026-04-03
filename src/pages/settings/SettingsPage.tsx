"use client";

import { useGetAgencyQuery } from "@/src/entities/profile/api/profileApi";
import {
  clearProfileData,
  setProfileData,
} from "@/src/entities/profile/slice/profileSlice";
import Loader from "@/src/shared/components/Loader";
import { useAppDispatch, useAppSelector } from "@/src/shared/hooks/redux";
import AgencySettings from "@/src/widgets/agency-settings/AgencySettings";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const SettingsPage = () => {
  const { data, isLoading } = useGetAgencyQuery();
  const dispatch = useAppDispatch();
  const session = useAppSelector((state) => state.profile.session);
  const searchParams = useSearchParams();
  const selectedAgencyId = searchParams?.get("agency_id") ?? null;

  //диспатчим в стор чтобы проще достать в SettingsProfileBadge.tsx; возможно оверэнджениринг
  useEffect(() => {
    if (!data) {
      dispatch(clearProfileData());
      return;
    }
    dispatch(
      setProfileData({
        agencies: data,
        selectedAgencyId,
      }),
    );
  }, [selectedAgencyId, data, dispatch]);

  return (
    <div className="container">
      {!session || isLoading ? (
        <Loader text={"Загружаем ваш профиль"} />
      ) : (
        <AgencySettings session={session} />
      )}
    </div>
  );
};

export default SettingsPage;
