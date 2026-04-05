import { Milestone } from "../../milestone/lib/types";

export type ProjectStatus =
  | "wait_review"
  | "paused"
  | "in_progress"
  | "completed";

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
  agency_id: string;
  name: string;
  description?: string | null;
  status?: ProjectStatus | null;
}
