import { z } from "zod";

// Internship Detail Schema
const internshipDetailSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  duration: z.string().min(1, "Duration is required"),
  role: z.string().optional(),
  description: z.string().optional(),
});

// Project Detail Schema
const projectDetailSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().min(1, "Project description is required"),
  technologies: z.array(z.string()).optional(),
  github_url: z.string().url().optional().or(z.literal("")),
  live_url: z.string().url().optional().or(z.literal("")),
});

// Language Proficiency Schema
const languageProficiencySchema = z.object({
  language: z.string().min(1, "Language is required"),
  proficiency_level: z.enum(["beginner", "proficient", "fluent", "native"]),
});

// Personal Information Step Schema
export const personalInfoSchema = z.object({
  first_name: z.string()
    .optional()
    .refine((val) => !val || val.trim().length === 0 || val.trim().length >= 2, "First name must be at least 2 characters"),
  last_name: z.string()
    .optional()
    .refine((val) => !val || val.trim().length === 0 || val.trim().length >= 2, "Last name must be at least 2 characters"),
  phone: z.string()
    .optional()
    .refine(
      (val) => !val || val.trim().length === 0 || val.trim().length >= 10,
      "Phone number must be at least 10 digits"
    ),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  current_address: z.string().optional(),
});

// Academic Information Step Schema
export const academicInfoSchema = z.object({
  highest_qualification: z.string().optional(),
  college_name: z.string().optional(),
  course: z.string().optional(),
  branch: z.string().optional(),
  passing_year: z.number()
    .optional()
    .refine((val) => val === undefined || Number.isInteger(val), "Passing year must be a whole number")
    .refine((val) => val === undefined || val >= 2000, "Passing year must be 2000 or later")
    .refine((val) => val === undefined || val <= 2030, "Passing year must be 2030 or earlier"),
  percentage: z.number()
    .optional()
    .refine((val) => val === undefined || val >= 0, "Percentage cannot be negative")
    .refine((val) => val === undefined || val <= 100, "Percentage cannot exceed 100"),
  cgpa: z.number()
    .optional()
    .refine((val) => val === undefined || val >= 0, "CGPA cannot be negative")
    .refine((val) => val === undefined || val <= 10, "CGPA cannot exceed 10"),
});

// Additional Information Step Schema
export const additionalInfoSchema = z.object({
  technical_skills: z.array(z.string()).optional(),
  soft_skills: z.array(z.string()).optional(),
  experience_type: z.enum(["fresher", "experienced"]).optional(),
  internship_details: z.array(internshipDetailSchema).optional(),
  projects: z.array(projectDetailSchema).optional(),
  languages: z.array(languageProficiencySchema).optional(),
  job_type: z.array(z.string()).optional(),
  work_mode: z.array(z.string()).optional(),
  preferred_job_role: z.array(z.string()).optional(),
  preferred_location: z.array(z.string()).optional(),
  expected_salary: z.number()
    .optional()
    .refine((val) => val === undefined || val >= 0, "Expected salary cannot be negative"),
  github_profile: z.string().url().optional().or(z.literal("")),
  linkedin_profile: z.string().url().optional().or(z.literal("")),
  portfolio_url: z.string().url().optional().or(z.literal("")),
  coding_platforms: z.record(z.string()).optional(),
  resume_url: z.string().optional(),
});

// Complete Profile Schema
export const completeProfileSchema = personalInfoSchema.merge(academicInfoSchema).merge(additionalInfoSchema);

// Type exports
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type AcademicInfoFormData = z.infer<typeof academicInfoSchema>;
export type AdditionalInfoFormData = z.infer<typeof additionalInfoSchema>;
export type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;
