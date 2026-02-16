import { z } from "zod";

// Internship Detail Schema
const internshipDetailSchema = z.object({
  company_name: z.string().optional(),
  duration: z.string().optional(),
  role: z.string().optional(),
  description: z.string().optional(),
});

// Helper function for optional URL validation (allows empty string, undefined, or valid URL)
const optionalUrlSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (val === undefined || val === "" || val === null) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Must be a valid URL" }
  );

// Project Detail Schema
const projectDetailSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  github_url: optionalUrlSchema,
  live_url: optionalUrlSchema,
});

// Language Proficiency Schema
const languageProficiencySchema = z.object({
  language: z.string().optional(),
  proficiency_level: z
    .union([z.enum(["beginner", "proficient", "fluent", "native"]), z.literal("")])
    .optional()
    .or(z.undefined()),
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
  experience_type: z
    .union([z.enum(["fresher", "experienced"]), z.literal("")])
    .optional(),
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
  github_profile: optionalUrlSchema,
  linkedin_profile: optionalUrlSchema,
  portfolio_url: optionalUrlSchema,
  coding_platforms: z.record(z.string(), z.string()).optional(),
  resume_url: z.string().optional(),
});

// Complete Profile Schema
export const completeProfileSchema = personalInfoSchema.merge(academicInfoSchema).merge(additionalInfoSchema);

// Type exports
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type AcademicInfoFormData = z.infer<typeof academicInfoSchema>;
export type AdditionalInfoFormData = z.infer<typeof additionalInfoSchema>;
export type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;
