import { z } from "zod";
import { StudentProfile } from "./student";

// Base profile form data structure
export interface BaseProfileFormData {
  // Personal Information
  first_name: string;
  last_name: string;
  phone: string;
  email?: string; // Read-only for students
  course?: string; // e.g., SoDA
  current_module?: string; // e.g., Module 06
  career_goal?: string; // e.g., Wants to be a data analyst
  
  // Academic Information
  degree: string;
  branch: string;
  passing_year: number;
  cgpa: number;
  college_id?: number; // Read-only for students
  educational_qualification?: string; // e.g., 12th pass
  institute_name?: string; // e.g., NavGurukul
  status?: "Completed" | "Pursuing"; // Course status
  
  // Additional Information
  resume_url?: string;
  portfolio_url?: string; // GitHub/Portfolio link
  skills?: string; // Comma-separated skills e.g., "Tableau,Python,PowerBI,SQL"
  preferred_work_mode?: string; // Comma-separated e.g., "Remote,In office"
  looking_for?: string; // Comma-separated e.g., "Internship,Full time"
  
  // Computed/Read-only fields (from API response)
  id?: number;
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

