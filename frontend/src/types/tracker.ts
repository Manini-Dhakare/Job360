export type ApplicationStage =
  | "wishlist"
  | "applied"
  | "phone_screen"
  | "tech_interview"
  | "final_round"
  | "offered"
  | "rejected";

export interface ApplicationCard {
  app_id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  status: ApplicationStage;
  kanban_order: number;
  interview_date?: string;
  applied_at: string;
}
