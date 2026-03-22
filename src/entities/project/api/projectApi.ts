import { supabase } from "@/src/shared/api/supabase/client"; // Твой конфиг супабейза
import { baseApi } from "@/src/shared/api/baseApi";
import { Project } from "../lib/types";

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
          .select("*")
          .order("created_at", { ascending: false });

        if (error) return { error };
        return { data };
      },
      providesTags: ["Project"],
    }),
  }),
});

export const { useGetProjectByTokenQuery, useGetAgencyProjectsQuery } =
  projectApi;
