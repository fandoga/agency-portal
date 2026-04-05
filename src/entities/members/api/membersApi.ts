import { supabase } from "@/src/shared/api/supabase/client"; // Твой конфиг супабейза
import { baseApi } from "@/src/shared/api/baseApi";
import { Member } from "../lib/types";

export const membersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // 2. Список проектов для админки
    getAgencyMembers: build.query<Member[], { agency_id: string }>({
      queryFn: async ({ agency_id }) => {
        const { data, error } = await supabase.rpc(
          "get_agency_members_with_email",
          { ag_id: agency_id },
        );
        if (error) return { error };
        return { data };
      },
      providesTags: ["Members"],
    }),
  }),
});

export const { useGetAgencyMembersQuery } = membersApi;
