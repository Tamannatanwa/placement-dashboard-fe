// Job data structure based on API response
export interface Job {
  id: string;
  title: string;
  company_id: string;
  company_name: string;
  description: string;
  skills_required: string[];
  experience_required: string;
  salary_range: Record<string, any>;
  is_fresher: boolean;
  work_type: "remote" | "on-site" | "hybrid";
  experience_min: number;
  experience_max: number;
  salary_min: number;
  salary_max: number;
  location: string;
  job_type: "remote" | "office" | "hybrid";
  employment_type: "fulltime" | "parttime" | "contract" | "internship";
  source: string;
  source_url: string;
  is_active: boolean;
  view_count: number;
  application_count: number;
  created_at: string;
  updated_at: string;
  company?: {
    id: string;
    name: string;
    domain: string;
    logo_url: string;
    website: string;
  };
  raw_text?: string;
  is_verified: boolean;
}

export interface JobsResponse {
  items: Job[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface JobFilters {
  location?: string;
  skills?: string; // Comma-separated
  job_type?: "remote" | "office" | "hybrid";
  employment_type?: "fulltime" | "parttime" | "contract" | "internship";
  work_type?: "remote" | "on-site" | "hybrid";
  is_fresher?: boolean;
  min_experience?: number;
  max_experience?: number;
  min_salary?: number;
  max_salary?: number;
  company_id?: string;
  is_active?: boolean;
  sort_by?: "created_at" | "title" | "location" | "view_count";
  sort_order?: "asc" | "desc";
  page?: number;
  size?: number;
}


