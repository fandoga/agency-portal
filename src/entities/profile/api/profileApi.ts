import { supabase } from "@/src/shared/api/supabase/client";
import { baseApi } from "@/src/shared/api/baseApi";
import { CreateProfileInput, DeleteProfileArg, Profile } from "../lib/types";

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
    //3. Получение списка агенств
    getAgency: build.query<Profile[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("updated_at", { ascending: false });

        if (error) return { error };
        return { data };
      },
      providesTags: ["Profile"],
    }),
  }),
});

export const {
  useCreateNewProfileMutation,
  useGetAgencyQuery,
  useDeleteProfileMutation,
} = profileApi;
