export type ProjectStatus =
  | "wait_review"
  | "paused"
  | "in_progress"
  | "completed";

export type MilestoneStatus = "todo" | "in_progress" | "done" | "review";

export interface Milestone {
  id: string; // uuid
  project_id: string; // uuid -> references Project.id
  title: string;
  description?: string | null;
  status?: MilestoneStatus | null; // default 'todo'
  due_date?: string | null;
  completed_at?: string | null;
}

export interface Project {
  id: string; // uuid
  agency_id: string; // uuid -> references Profile.id
  name: string;
  description?: string | null;
  milestones?: Milestone[] | null;
  status?: ProjectStatus | null; // default 'in_progress'
  share_token?: string | null;
  created_at?: string | null;
}

export interface createProjectType {
  name: string;
  description?: string | null;
  status?: ProjectStatus | null;
}
