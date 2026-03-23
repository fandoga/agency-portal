export type ProjectStatus = "active" | "paused" | "completed";

export interface Project {
  id: string; // uuid
  agency_id: string; // uuid -> references Profile.id
  name: string;
  description?: string | null;
  status?: ProjectStatus | null; // default 'active'
  share_token?: string | null;
  created_at?: string | null;
}

export interface createProjectType {
  name: string;
  description?: string | null;
  status?: ProjectStatus | null;
}
