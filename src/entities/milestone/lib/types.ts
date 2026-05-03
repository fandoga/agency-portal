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
  agency_id: string;
  project_id: string;
  name: string;
  description?: string | null;
  status?: MilestoneStatus | null;
  due_date?: string | null;
};

export type DeleteMilestoneArg = {
  agency_id: string;
  milestoneId: string;
  projectId: string;
};

export type UpdateMilestoneStatusArg = DeleteMilestoneArg & {
  status: MilestoneStatus;
};
