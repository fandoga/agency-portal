import { supabase } from "@/src/shared/api/supabase/client";
import { baseApi } from "@/src/shared/api/baseApi";
import {
  CreateProfileInput,
  DeleteProfileArg,
  Profile,
  UpdateOrganizationSettingsInput,
} from "../lib/types";

export const profileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // 1. создание профиля агенства
    createNewProfile: build.mutation<Profile, CreateProfileInput>({
      queryFn: async ({
        agency_name,
        website_url,
        logo_url,
      }: CreateProfileInput) => {
        const { data: userData, error: userErr } =
          await supabase.auth.getUser();
        if (userErr) return { error: userErr };
        if (!userData.user) return { error: { message: "Not authenticated" } };

        const id = crypto.randomUUID();

        const { data, error } = await supabase
          .from("profiles")
          .insert({
            id,
            user_id: userData.user.id,
            agency_name,
            website_url: website_url || "",
            logo_url: logo_url || "",
          })
          .single();

        if (error) return { error };
        return { data };
      },
      invalidatesTags: (result) =>
        result
          ? [{ type: "Profile" as const, id: result.id }, "Profile"]
          : ["Profile"],
    }),
    // 2. Удаление агенства
    deleteProfile: build.mutation<null, DeleteProfileArg>({
      queryFn: async ({ profileId }) => {
        const { error } = await supabase
          .from("profiles")
          .delete()
          .eq("id", profileId);

        if (error) return { error };
        return { data: null };
      },
      invalidatesTags: ["Profile"],
    }),
    // 3. Получение списка агенств
    getAgency: build.query<Profile[], string | null | undefined>({
      queryFn: async (userId) => {
        if (!userId) return { data: [] };
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("updated_at", { ascending: false });

        if (error) return { error };
        return { data };
      },
      keepUnusedDataFor: 300,
      providesTags: ["Profile"],
    }),
    // 4. Обновление настроек организации
    updateOrganizationSettings: build.mutation<
      Profile,
      UpdateOrganizationSettingsInput
    >({
      queryFn: async ({ profileId, agency_name, color_theme, logo_url }) => {
        // 1. Verify authentication
        const { data: userData, error: userErr } =
          await supabase.auth.getUser();
        if (userErr || !userData.user) return { error: userErr };

        // 2. Build update object (only provided fields)
        const updates: Partial<Profile> = {};
        if (agency_name !== undefined) updates.agency_name = agency_name;
        if (color_theme !== undefined) updates.color_theme = color_theme;
        if (logo_url !== undefined) updates.logo_url = logo_url;

        // 3. Update profile
        const { data, error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", profileId)
          .select()
          .single();

        if (error) return { error };
        return { data };
      },
      invalidatesTags: (result, error, { profileId }) =>
        result ? [{ type: "Profile", id: profileId }, "Profile"] : [],
      // Optimistic update
      async onQueryStarted(
        { profileId, ...patch },
        { dispatch, queryFulfilled },
      ) {
        const patchResult = dispatch(
          profileApi.util.updateQueryData(
            "getAgency",
            undefined,
            (draft: Profile[]) => {
              const profile = draft.find((p) => p.id === profileId);
              if (profile) {
                Object.assign(profile, patch);
              }
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useCreateNewProfileMutation,
  useGetAgencyQuery,
  useDeleteProfileMutation,
  useUpdateOrganizationSettingsMutation,
} = profileApi;
