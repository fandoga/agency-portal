import { useGetAgencyQuery } from "@/src/entities/profile/api/profileApi";
import type { Profile } from "@/src/entities/profile/lib/types";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/src/shared/providers/authProvider";

export const useGetAgencyData = () => {
  const searchParams = useSearchParams();
  const { session: authSession } = useAuth();
  const { data, isLoading } = useGetAgencyQuery(authSession?.user?.id, {
    refetchOnMountOrArgChange: true,
  });
  if (!data) {
    return {
      agencies: [] as Profile[],
      session: null,
      otherAgency: [] as Profile[],
      isLoading,
    };
  }
  const selectedAgencyId = searchParams?.get("agency_id") ?? null;
  const session = data.find((agency) => agency.id === selectedAgencyId) ?? null;
  const otherAgency = data.filter((agency) => agency.id !== selectedAgencyId);

  return { agencies: data, session, otherAgency, isLoading, selectedAgencyId };
};
