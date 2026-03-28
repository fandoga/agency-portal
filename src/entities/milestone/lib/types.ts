export type MilestoneStatus = "todo" | "in_progress" | "done" | "review";

export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  description?: string | null;
  status?: MilestoneStatus | null;
  due_date?: string | null;
  completed_at?: string | null;
}

export type CreateMilestoneInput = {
  project_id: string;
  name: string;
  description?: string | null;
  status?: MilestoneStatus | null;
  due_date?: string | null;
};

export type DeleteMilestoneArg = {
  milestoneId: string;
  projectId: string;
};
