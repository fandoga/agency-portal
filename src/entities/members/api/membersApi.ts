import { supabase } from "@/src/shared/api/supabase/client"; // Твой конфиг супабейза
import { baseApi } from "@/src/shared/api/baseApi";
import { createMemberInviteType, Member } from "../lib/types";

export const membersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // 1. Список участников команды
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
    createNewInvite: build.mutation<Member, createMemberInviteType>({
      queryFn: async ({ agency_id, role, token }: createMemberInviteType) => {
        const { data: userData, error: userErr } =
          await supabase.auth.getUser();
        if (userErr) return { error: userErr };
        if (!userData.user) return { error: { message: "Not authenticated" } };

        const id = crypto.randomUUID();

        const { data, error } = await supabase
          .from("invites")
          .insert({
            id,
            agency_id,
            role,
            token,
          })
          .single();

        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Members"],
    }),
  }),
});

export const { useGetAgencyMembersQuery, useCreateNewInviteMutation } =
  membersApi;
