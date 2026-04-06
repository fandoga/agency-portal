export type Role = "owner" | "admin" | "member";

export type Status = "pending" | "accepted" | "rejected" | "expired";

export interface Member {
  user_id: string;
  role: Role;
  email: string;
}

export interface createMemberInviteType {
  agency_id: string;
  role: Role;
  token: string | null;
}

export interface createAgencyMemberType {
  user_id: string;
  token: string;
  role: Role;
}

export interface Invite {
  id: string;
  role: Role;
  token: string;
  status?: Status | null;
  created_at?: string;
  agency_name: string;
}
