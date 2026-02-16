import { z } from "zod";
import { StudentProfile } from "./student-profile";

// Base profile form data structure - Matches new schema
export interface BaseProfileFormData {
  // Personal Information
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string; // Read-only for students
  date_of_birth?: string;
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
  
  // Experience
  experience_type?: "fresher" | "experienced";
  internship_details?: Array<{
    company_name?: string;
    duration?: string;
    role?: string;
    description?: string;
  }>;
  projects?: Array<{
    title?: string;
    description?: string;
    technologies?: string[];
    github_url?: string;
    live_url?: string;
  }>;
  
  // Languages
  languages?: Array<{
    language?: string;
    proficiency_level?: "beginner" | "proficient" | "fluent" | "native";
  }>;
  
  // Job Preferences
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
  
  // Computed/Read-only fields (from API response)
  id?: string;
  full_name?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  profile_completeness?: number;
  saved_jobs_count?: number;
  
  [key: string]: any; // For extensibility
}

// Student-specific profile form data
export interface StudentProfileFormData extends BaseProfileFormData {
  // Student-specific fields can be added here
}

// Admin-specific profile form data (if needed in future)
export interface AdminProfileFormData extends BaseProfileFormData {
  // Admin-specific fields can be added here
}

// Union type for polymorphic usage
export type ProfileFormData = StudentProfileFormData | AdminProfileFormData;

// Step configuration
export interface ProfileStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  validationSchema: z.ZodSchema;
}

// Wizard state
export interface WizardState {
  currentStep: number;
  completedSteps: number[];
  formData: Partial<ProfileFormData>;
  errors: Record<string, string[]>;
}

// Step navigation props
export interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onStepClick?: (step: number) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isSubmitting?: boolean;
}

// Step content props
export interface StepContentProps {
  formData: Partial<ProfileFormData>;
  onUpdate: (data: Partial<ProfileFormData>) => void;
  errors?: Record<string, string[]>;
}

