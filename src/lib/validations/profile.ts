import { z } from "zod";

// Personal Information Step Schema - All fields optional
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
    )
    .refine(
      (val) => !val || val.trim().length === 0 || /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(val),
      "Invalid phone number format"
    ),
  course: z.string().optional(),
  current_module: z.string().optional(),
  career_goal: z.string().optional(),
});

// Academic Information Step Schema - All fields optional
export const academicInfoSchema = z.object({
  degree: z.string().optional(),
  branch: z.string()
    .optional()
    .refine((val) => !val || val.trim().length === 0 || val.trim().length >= 2, "Branch must be at least 2 characters"),
  passing_year: z.number()
    .optional()
    .refine((val) => val === undefined || Number.isInteger(val), "Passing year must be a whole number")
    .refine((val) => val === undefined || val >= 2020, "Passing year must be 2020 or later")
    .refine((val) => val === undefined || val <= 2030, "Passing year must be 2030 or earlier"),
  cgpa: z.number()
    .optional()
    .refine((val) => val === undefined || val >= 0, "CGPA cannot be negative")
    .refine((val) => val === undefined || val <= 10, "CGPA cannot exceed 10"),
  educational_qualification: z.string().optional(),
  institute_name: z.string().optional(),
  status: z.enum(["Completed", "Pursuing"]).optional(),
});

// Additional Information Step Schema (optional fields)
export const additionalInfoSchema = z.object({
  resume_url: z.string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      { message: "Invalid URL format" }
    ),
  portfolio_url: z.string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      { message: "Invalid URL format" }
    ),
  skills: z.string().optional(),
  preferred_work_mode: z.string().optional(),
  looking_for: z.string().optional(),
});

// Complete Profile Schema - All fields optional (for partial submissions)
export const completeProfileSchema = personalInfoSchema.merge(academicInfoSchema).merge(additionalInfoSchema);

// Type exports
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type AcademicInfoFormData = z.infer<typeof academicInfoSchema>;
export type AdditionalInfoFormData = z.infer<typeof additionalInfoSchema>;
export type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;


