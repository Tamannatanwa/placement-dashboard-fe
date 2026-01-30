/**
 * Dummy API implementation for student profile
 * Stores data in localStorage until real API is ready
 */

import { StudentProfile } from "@/types/student";

const STORAGE_KEY = "student_profile_dummy";

// Dummy profile data structure
interface DummyProfileData {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  college_id: number;
  degree: string;
  branch: string;
  passing_year: number;
  cgpa: number;
  resume_url?: string;
}

/**
 * Get dummy profile from localStorage
 */
export function getDummyProfile(): StudentProfile | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as StudentProfile;
    }
  } catch (error) {
    console.error("Error reading dummy profile:", error);
  }
  
  return null;
}

/**
 * Save dummy profile to localStorage
 */
export function saveDummyProfile(data: Partial<DummyProfileData>): StudentProfile {
  if (typeof window === "undefined") {
    throw new Error("localStorage is not available");
  }

  const existing = getDummyProfile();
  const userInfo = typeof window !== "undefined" 
    ? JSON.parse(localStorage.getItem("user_info") || "{}")
    : { email: "user@example.com", id: "1" };

  const now = new Date().toISOString();
  
  // Calculate profile completeness based on merged data
  const mergedData = { ...existing, ...data };
  const requiredFields = [
    "first_name",
    "last_name",
    "phone",
    "degree",
    "branch",
    "passing_year",
    "cgpa",
  ];
  
  const filledFields = requiredFields.filter(
    (field) => {
      const value = mergedData[field as keyof StudentProfile];
      return value !== undefined && 
             value !== null &&
             value !== "" &&
             (typeof value !== "number" || value > 0 || field === "cgpa"); // Allow 0 for CGPA
    }
  ).length;
  
  const profileCompleteness = Math.round((filledFields / requiredFields.length) * 100);

  const profile: StudentProfile = {
    id: existing?.id || parseInt(userInfo.id || "1", 10),
    email: data.email || existing?.email || userInfo.email || "user@example.com",
    first_name: data.first_name || existing?.first_name || "",
    last_name: data.last_name || existing?.last_name || "",
    phone: data.phone || existing?.phone || "",
    college_id: data.college_id ?? existing?.college_id ?? 0,
    degree: data.degree || existing?.degree || "",
    branch: data.branch || existing?.branch || "",
    passing_year: data.passing_year ?? existing?.passing_year ?? new Date().getFullYear(),
    cgpa: data.cgpa ?? existing?.cgpa ?? 0,
    full_name: `${data.first_name || existing?.first_name || ""} ${data.last_name || existing?.last_name || ""}`.trim() || "Student",
    resume_url: data.resume_url || existing?.resume_url || "",
    is_active: existing?.is_active ?? true,
    created_at: existing?.created_at || now,
    updated_at: now,
    profile_completeness: profileCompleteness,
    saved_jobs_count: existing?.saved_jobs_count || 0,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

/**
 * Initialize dummy profile if it doesn't exist
 */
export function initDummyProfile(): StudentProfile {
  const existing = getDummyProfile();
  if (existing) {
    return existing;
  }

  const userInfo = typeof window !== "undefined" 
    ? JSON.parse(localStorage.getItem("user_info") || "{}")
    : { email: "user@example.com", id: "1" };

  const now = new Date().toISOString();
  
  const defaultProfile: StudentProfile = {
    id: parseInt(userInfo.id || "1", 10),
    email: userInfo.email || "user@example.com",
    first_name: "",
    last_name: "",
    phone: "",
    college_id: 0,
    degree: "",
    branch: "",
    passing_year: new Date().getFullYear(),
    cgpa: 0,
    full_name: "Student",
    resume_url: "",
    is_active: true,
    created_at: now,
    updated_at: now,
    profile_completeness: 0,
    saved_jobs_count: 0,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfile));
  return defaultProfile;
}

