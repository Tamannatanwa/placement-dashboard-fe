/**
 * Student Profile Types - Matching Backend Schema
 */

export interface InternshipDetail {
  company_name: string;
  duration: string;
  role?: string;
  description?: string;
}

export interface ProjectDetail {
  title: string;
  description: string;
  technologies?: string[];
  github_url?: string;
  live_url?: string;
}

export interface LanguageProficiency {
  language: string;
  proficiency_level: "beginner" | "proficient" | "fluent" | "native";
}

export interface StudentProfile {
  // Personal Details
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  date_of_birth?: string; // ISO date format
  gender?: string;
  current_address?: string;
  
  // Education Details
  highest_qualification?: string; // 10th, 12th, Diploma, Graduation, Post-Graduation
  college_name?: string;
  college_id?: number;
  course?: string;
  branch?: string;
  passing_year?: number;
  percentage?: number;
  cgpa?: number;
  
  // Skills
  technical_skills?: string[];
  soft_skills?: string[];
  skill_required?: string[];
  
  // Experience
  experience_type?: "fresher" | "experienced";
  internship_details?: InternshipDetail[];
  projects?: ProjectDetail[];
  
  // Languages
  languages?: LanguageProficiency[];
  
  // Job Preferences (nested object - preferred)
  preference?: {
    job_type?: string[];
    work_mode?: string[];
    preferred_job_role?: string[];
    preferred_location?: string[];
    expected_salary?: number;
  };
  
  // Job Preferences (flat fields - deprecated, use preference object instead)
  // Kept for backward compatibility and internal form state
  job_type?: string[];
  work_mode?: string[];
  preferred_job_role?: string[];
  preferred_location?: string[];
  expected_salary?: number;
  
  // Technical Profile Links
  github_profile?: string;
  linkedin_profile?: string;
  portfolio_url?: string;
  coding_platforms?: { [key: string]: string };
  
  // Resume
  resume_url?: string;
  
  // Metadata
  id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  profile_completeness?: number;
}

export type StudentProfileUpdate = Partial<StudentProfile>;

