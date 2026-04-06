export type Role = "owner" | "admin" | "member";

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
