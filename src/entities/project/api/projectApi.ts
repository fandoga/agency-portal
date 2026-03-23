import { supabase } from "@/src/shared/api/supabase/client"; // Твой конфиг супабейза
import { baseApi } from "@/src/shared/api/baseApi";
import { createProjectType, Project } from "../lib/types";

export const projectApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // 1. Получение проекта по токену (для портала клиента)
    getProjectByToken: build.query<Project, string>({
      queryFn: async (token) => {
        const { data, error } = await supabase
          .from("projects")
          .select("*, milestones(*)") // Сразу тянем этапы
          .eq("share_token", token)
          .single();

        if (error) return { error };
        console.log(data);
        return { data };
      },
      providesTags: (result) => [{ type: "Project", id: result?.id }],
    }),

    // 2. Список проектов для админки
    getAgencyProjects: build.query<Project[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from("projects")
          .select("*, milestones(*)")
          .order("created_at", { ascending: false });

        if (error) return { error };
        return { data };
      },
      providesTags: ["Project"],
    }),
    // 3. Создания нового проекта
    createNewProject: build.mutation<Project, createProjectType>({
      queryFn: async ({ name, description, status }: createProjectType) => {
        const { data: userData, error: userErr } =
          await supabase.auth.getUser();
        if (userErr) return { error: userErr };
        if (!userData.user) return { error: { message: "Not authenticated" } };

        const id = crypto.randomUUID();
        const share_token = crypto.randomUUID();

        const { data, error } = await supabase
          .from("projects")
          .insert({
            id,
            agency_id: userData.user.id,
            name,
            description,
            status,
            share_token,
          })
          .single();

        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Project"],
    }),
  }),
});

export const {
  useGetProjectByTokenQuery,
  useCreateNewProjectMutation,
  useGetAgencyProjectsQuery,
} = projectApi;
