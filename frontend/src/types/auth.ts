export type UserRole = "CANDIDATE" | "ADMIN";

export interface User {
  user_id: string;
  email: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  created_at: string;
}

export interface CandidateProfile {
  profile_id: string;
  user_id: string;
  headline?: string;
  bio?: string;
  target_role?: string;
  yoe?: number;
  location?: string;
  remote_pref: "REMOTE" | "HYBRID" | "ONSITE";
}
