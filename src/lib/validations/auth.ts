import { z } from "zod";

// Generic email validation (no domain restriction)
const emailSchema = z.string().email("Invalid email address");

// Email domain validation for @navgurukul.org (used where we still need restriction)
const navgurukulEmail = emailSchema.refine(
  (email) => email.endsWith("@navgurukul.org"),
  {
    message: "Only @navgurukul.org emails are allowed",
  }
);

// Login: allow any valid email (no @navgurukul.org restriction)
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

// Signup: keep requiring @navgurukul.org emails
export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: navgurukulEmail,
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["student", "placement_team", "admin"]).refine((val) => val !== undefined, {
    message: "Please select a role",
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

