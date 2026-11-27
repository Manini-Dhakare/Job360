export interface TriScore {
  job_match_score: number;       // Holistic candidate fit (0-100)
  resume_match_score: number;    // Document keyword & vector overlap (0-100)
  ats_score: number;             // Formatting and structure compliance (0-100)
  verified_skills_boost: number; // Boost from verified badges
  missing_skills: string[];
}
