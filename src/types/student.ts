// Student data structure based on Excel sheet (for admin/placement views)
export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  campus?: string;
  school?: string;
  resume?: string; // Resume file path or URL
  projects?: string; // Projects information
  status: StudentStatus;
  group?: string;
  feedback?: string;
  resumeScore?: number; // Score out of 10 for resume quality
  resumeStructure?: string; // Review of resume structure
  resumeProjects?: string; // Review of projects in resume
  projectScore?: number; // Score out of 10 for project quality
  projectDifficulty?: "easy" | "medium" | "hard"; // Project difficulty level
  projectReview?: string; // Detailed project review
  rawStatus?: string; // Original status from Excel
  [key: string]: any; // For other Excel columns
}

// Student profile structure from API (for student's own profile)
export interface StudentProfile {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  college_id: number;
  degree: string;
  branch: string;
  passing_year: number;
  cgpa: number;
  id: number;
  full_name: string;
  resume_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile_completeness: number;
  saved_jobs_count: number;
}

export type StudentStatus = 
  | "placed" 
  | "unplaced" 
  | "internship_unpaid" 
  | "internship_paid" 
  | "job_ready" 
  | "job_ready_under_process" 
  | "long_leave" 
  | "dropout";

