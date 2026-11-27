export interface Job {
  job_id: string;
  company_id?: string;
  company_name?: string;
  company_logo?: string;
  title: string;
  description: string;
  location?: string;
  is_remote: boolean;
  min_yoe: number;
  salary_min?: number;
  salary_max?: number;
  source_url: string;
  posted_at: string;
  job_match_score?: number;
  resume_match_score?: number;
  ats_score?: number;
}
