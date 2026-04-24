import { supabase } from "@/src/shared/api/supabase/client"; // Твой конфиг супабейза
import { baseApi } from "@/src/shared/api/baseApi";
import {
  createAgencyMemberType,
  createMemberInviteType,
  Invite,
  Member,
} from "../lib/types";

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
    // 2. Получение инвайта по токену
    getInviteByToken: build.query<Invite[], { token: string }>({
      queryFn: async ({ token }) => {
        const { data, error } = await supabase.rpc("get_invite_by_token", {
          p_token: token,
        });
        if (error) return { error };
        if (!data) {
          return { error: { message: "Invite not found" } };
        }

        return {
          data,
        };
      },
    }),
    // 3. Создание нового приглашения
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
    // 4. Добавление участника в агентство
    createAgencyMember: build.mutation<Member, createAgencyMemberType>({
      queryFn: async ({ user_id, token, role }) => {
        const { data, error } = await supabase.rpc("accept_agency_invite", {
          p_token: token,
          p_user_id: user_id,
          p_role: role ?? null,
        });

        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Members"],
    }),
  }),
});

export const {
  useGetAgencyMembersQuery,
  useGetInviteByTokenQuery,
  useCreateNewInviteMutation,
  useCreateAgencyMemberMutation,
} = membersApi;
