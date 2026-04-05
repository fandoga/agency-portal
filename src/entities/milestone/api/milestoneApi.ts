import { supabase } from "@/src/shared/api/supabase/client";
import { baseApi } from "@/src/shared/api/baseApi";
import type { RootState } from "@/src/store/store";
import {
  CreateMilestoneInput,
  DeleteMilestoneArg,
  Milestone,
} from "../lib/types";

export const milestoneApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // 1. создание задачи
    createNewMilestone: build.mutation<Milestone, CreateMilestoneInput>({
      queryFn: async ({
        agency_id,
        project_id,
        name,
        description,
        status,
        due_date,
      }: CreateMilestoneInput) => {
        const { data: userData, error: userErr } =
          await supabase.auth.getUser();
        if (userErr) return { error: userErr };
        if (!userData.user) return { error: { message: "Not authenticated" } };

        const { data: project, error: pErr } = await supabase
          .from("projects")
          .select("id")
          .eq("id", project_id)
          .eq("agency_id", agency_id)
          .single();

        if (pErr || !project) {
          return { error: { message: "Проект не найден или нет доступа" } };
        }

        const id = crypto.randomUUID();

        const { data, error } = await supabase
          .from("milestones")
          .insert({
            id,
            project_id,
            name,
            description: description ?? null,
            status: status ?? "todo",
            due_date: due_date ?? null,
          })
          .single();

        if (error) return { error };
        return { data };
      },
      invalidatesTags: (result) =>
        result
          ? [{ type: "Project" as const, id: result.project_id }, "Project"]
          : ["Project"],
    }),
    // 2. Удаление задачи
    deleteMilestone: build.mutation<null, DeleteMilestoneArg>({
      queryFn: async ({ milestoneId, projectId, agency_id }) => {
        const { data: userData, error: userErr } =
          await supabase.auth.getUser();
        if (userErr) return { error: userErr };
        if (!userData.user) return { error: { message: "Not authenticated" } };

        const { data: project, error: pErr } = await supabase
          .from("projects")
          .select("id")
          .eq("id", projectId)
          .eq("agency_id", agency_id)
          .single();

        if (pErr || !project) {
          return { error: { message: "Проект не найден или нет доступа" } };
        }

        const { error } = await supabase
          .from("milestones")
          .delete()
          .eq("id", milestoneId)
          .eq("project_id", projectId);

        if (error) return { error };
        return { data: null };
      },
      invalidatesTags: (result, err, arg) => [
        { type: "Project" as const, id: arg.projectId },
        "Project",
      ],
    }),
  }),
});

export const { useCreateNewMilestoneMutation, useDeleteMilestoneMutation } =
  milestoneApi;
