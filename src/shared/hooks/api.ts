import { useGetAgencyQuery } from "@/src/entities/profile/api/profileApi";
import type { Profile } from "@/src/entities/profile/lib/types";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/src/shared/providers/authProvider";
import { useGetAgencyMembersQuery } from "@/src/entities/members/api/membersApi";

export const useGetAgencyData = () => {
  const searchParams = useSearchParams();
  const { session: authSession } = useAuth();
  const { data, isLoading } = useGetAgencyQuery(authSession?.user?.id, {
    skip: !authSession?.user?.id,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });
  if (!data) {
    return {
      agencies: [] as Profile[],
      session: null,
      otherAgency: [] as Profile[],
      isLoading,
    };
  }
  const selectedAgencyId = searchParams?.get("agency_id");
  const session = data.find((agency) => agency.id === selectedAgencyId);
  const otherAgency = data.filter((agency) => agency.id !== selectedAgencyId);

  return { agencies: data, session, otherAgency, isLoading, selectedAgencyId };
};

export const useGetUsersData = () => {
  const searchParams = useSearchParams();
  const selectedAgencyId = searchParams?.get("agency_id");
  const { session } = useAuth();
  const { data: agencyMembers, isLoading } = useGetAgencyMembersQuery({
    agency_id: selectedAgencyId || "",
  });
  const currentUser = agencyMembers?.find(
    (user) => user.user_id === session?.user.id,
  );
  return { session, isLoading, agencyMembers, currentUser };
};
