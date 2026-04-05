export type Role = "owner" | "admin" | "member";

export interface Member {
  user_id: string;
  role: Role;
  email: string;
}
