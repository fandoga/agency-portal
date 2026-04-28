import { supabase } from "@/src/shared/api/supabase/client"; // Твой конфиг супабейза
import { baseApi } from "@/src/shared/api/baseApi";
import { createProjectType, Project, ClientProjectData } from "../lib/types";

export const projectApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // 1. Получение проекта по токену (для портала клиента)
    getProjectByToken: build.query<Project, string>({
      queryFn: async (token) => {
        const { data, error } = await supabase
          .from("projects")
          .select("*, milestones(*)")
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
      queryFn: async ({
        agency_id,
        name,
        description,
        status,
      }: createProjectType) => {
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
            agency_id,
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
    // 4. Удаление проекта
    deleteProject: build.mutation<null, string>({
      queryFn: async (projectId) => {
        const { error } = await supabase
          .from("projects")
          .delete()
          .eq("id", projectId);

        if (error) return { error };
        return { data: null };
      },
      invalidatesTags: ["Project"],
    }),

    // 5. Получение проекта для клиентского портала (с данными агентства)
    getClientProjectByShareToken: build.query<ClientProjectData, string>({
      queryFn: async (shareToken) => {
        // Получаем проект с milestones
        const { data: project, error: projectError } = await supabase
          .from("projects")
          .select("*, milestones(*)")
          .eq("share_token", shareToken)
          .single();

        if (projectError) {
          return {
            error: {
              status: 404,
              data: { message: "Project not found" },
            },
          };
        }

        if (!project) {
          return {
            error: {
              status: 404,
              data: { message: "Project not found" },
            },
          };
        }

        // Получаем данные агентства
        const { data: agency, error: agencyError } = await supabase
          .from("profiles")
          .select("agency_name, logo_url, color_theme")
          .eq("id", project.agency_id)
          .single();

        if (agencyError) {
          return {
            error: {
              status: 500,
              data: { message: "Failed to fetch agency data" },
            },
          };
        }

        return {
          data: {
            project,
            agency: {
              agency_name: agency.agency_name,
              logo_url: agency.logo_url,
              color_theme: agency.color_theme,
            },
          },
        };
      },
      providesTags: (result) => [{ type: "Project", id: result?.project.id }],
    }),
  }),
});

export const {
  useGetProjectByTokenQuery,
  useCreateNewProjectMutation,
  useGetAgencyProjectsQuery,
  useDeleteProjectMutation,
  useGetClientProjectByShareTokenQuery,
} = projectApi;
