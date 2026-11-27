export interface Resume {
  resume_id: string;
  profile_id: string;
  title: string;
  file_url: string;
  is_primary: boolean;
  parsed_json?: Record<string, any>;
  created_at: string;
}

export interface CustomizedResume {
  cust_id: string;
  resume_id: string;
  job_id: string;
  customized_bullets: Array<{
    bullet_id: string;
    original: string;
    tailored: string;
    incorporated_skills: string[];
  }>;
  added_skills: string[];
  pdf_url?: string;
  docx_url?: string;
  created_at: string;
}
