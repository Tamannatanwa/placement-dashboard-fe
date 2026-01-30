import { z } from "zod";

// Personal Information Step Schema
export const personalInfoSchema = z.object({
  first_name: z.string().min(1, "First name is required").min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(1, "Last name is required").min(2, "Last name must be at least 2 characters"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Invalid phone number format"),
});

// Academic Information Step Schema
export const academicInfoSchema = z.object({
  degree: z.string().min(1, "Degree is required"),
  branch: z.string().min(1, "Branch is required").min(2, "Branch must be at least 2 characters"),
  passing_year: z.number()
    .int("Passing year must be a whole number")
    .min(2020, "Passing year must be 2020 or later")
    .max(2030, "Passing year must be 2030 or earlier"),
  cgpa: z.number()
    .min(0, "CGPA cannot be negative")
    .max(10, "CGPA cannot exceed 10")
    .refine((val) => val >= 0 && val <= 10, "CGPA must be between 0 and 10"),
});

// Additional Information Step Schema (optional fields)
export const additionalInfoSchema = z.object({
  resume_url: z.string().url("Invalid URL format").optional().or(z.literal("")),
}).optional();

// Complete Profile Schema (for final validation)
export const completeProfileSchema = personalInfoSchema.merge(academicInfoSchema).merge(additionalInfoSchema);

// Type exports
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type AcademicInfoFormData = z.infer<typeof academicInfoSchema>;
export type AdditionalInfoFormData = z.infer<typeof additionalInfoSchema>;
export type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;


