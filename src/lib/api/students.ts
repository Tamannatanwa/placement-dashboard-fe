import { getApiInstance } from "./axios-instance";
import { Job } from "@/types/job";
import { StudentProfile } from "@/types/student-profile";

// Dashboard stats structure (can be extended based on actual API response)
export interface DashboardStats {
  total_jobs?: number;
  [key: string]: any;
}

// Dashboard response structure
export interface DashboardResponse {
  student: StudentProfile;
  stats: DashboardStats;
  recent_jobs: Job[];
  saved_jobs_count: number;
  notifications_unread: number;
  profile_completeness: number;
  recommendations_available: number;
}

// Track job view request body
export interface TrackJobViewData {
  job_id: string;
  duration_seconds: number;
  source: string;
}

// Track job view response
export interface TrackJobViewResponse {
  detail?: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
  message?: string;
  success?: boolean;
}

// Update profile request - Matches backend StudentProfileUpdate schema
export interface UpdateProfileData {
  // Personal Details
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  current_address?: string | null;
  
  // Education Details
  highest_qualification?: string | null;
  college_name?: string | null;
  college_id?: number | null;
  course?: string | null;
  branch?: string | null;
  passing_year?: number | null;
  percentage?: number | null;
  cgpa?: number | null;
  
  // Skills
  technical_skills?: string[];
  soft_skills?: string[];
  
  // Experience
  experience_type?: string | null;
  internship_details?: Array<{
    company_name: string;
    duration: string;
    role?: string;
    description?: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    technologies?: string[];
    github_url?: string;
    live_url?: string;
  }>;
  
  // Languages
  languages?: Array<{
    language: string;
    proficiency_level: "beginner" | "proficient" | "fluent" | "native";
  }>;
  spoken_languages?: Array<{
    language: string;
    proficiency_level: "beginner" | "proficient" | "fluent" | "native";
  }>;
  
  // Job Preferences
  job_type?: string[];
  work_mode?: string[];
  preferred_job_role?: string[];
  preferred_location?: string[];
  expected_salary?: number | null;
  
  // Technical Profile Links
  github_profile?: string | null;
  linkedin_profile?: string | null;
  portfolio_url?: string | null;
  coding_platforms?: { [key: string]: string };
  social_links?: {
    github_profile?: string | null;
    linkedin_profile?: string | null;
    portfolio_url?: string | null;
    coding_platforms?: { [key: string]: string };
    [key: string]: any;
  };
}

const normalizeStudentProfile = (profile: StudentProfile): StudentProfile => {
  const spokenLanguages = Array.isArray(profile.spoken_languages)
    ? profile.spoken_languages
    : undefined;
  const socialLinks =
    profile.social_links && typeof profile.social_links === "object"
      ? profile.social_links
      : undefined;

  return {
    ...profile,
    languages:
      Array.isArray(profile.languages) && profile.languages.length > 0
        ? profile.languages
        : spokenLanguages,
    github_profile: profile.github_profile || socialLinks?.github_profile,
    linkedin_profile: profile.linkedin_profile || socialLinks?.linkedin_profile,
    portfolio_url: profile.portfolio_url || socialLinks?.portfolio_url,
    coding_platforms:
      profile.coding_platforms ||
      (socialLinks?.coding_platforms &&
      typeof socialLinks.coding_platforms === "object"
        ? socialLinks.coding_platforms
        : undefined),
  };
};

// Profile completeness response
export interface ProfileCompletenessResponse {
  percentage: number;
  missing_fields: string[];
  suggestions: string[];
  is_complete: boolean;
}

// Saved job item
export interface SavedJob {
  id: number;
  job_id: number;
  job: Job;
  folder: string;
  notes: string;
  saved_at: string;
}

// List saved jobs response
export interface SavedJobsResponse {
  total: number;
  saved_jobs: SavedJob[];
  folders: string[];
}

// Save job request
export interface SaveJobData {
  job_id: number;
  folder?: string;
  notes?: string;
}

// Check if saved response
export interface CheckSavedResponse {
  detail?: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
  is_saved?: boolean;
  saved_job?: SavedJob;
}

// Recommended job item
export interface RecommendedJob {
  job: Job;
  recommendation_score: number;
  match_reasons: string[];
  missing_skills: string[];
  is_saved: boolean;
  view_count: number;
  similar_jobs_count: number;
}

// Get recommended jobs response
export interface RecommendedJobsResponse {
  total: number;
  limit: number;
  offset: number;
  recommendations: RecommendedJob[];
  filters_applied: Record<string, any>;
}

// Similar jobs response
export interface SimilarJobsResponse {
  detail?: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
  jobs?: Job[];
  total?: number;
}

// Recommendation stats response
export interface RecommendationStatsResponse {
  total_recommendations?: number;
  average_score?: number;
  top_skills?: string[];
  improvement_areas?: string[];
  [key: string]: any;
}

/**
 * Student Dashboard API
 */
export const studentsApi = {
  /**
   * Get student dashboard data
   * GET /api/v1/students/me/dashboard
   */
  getDashboard: async (): Promise<DashboardResponse> => {
    const api = getApiInstance();
    const response = await api.get<DashboardResponse>("/api/v1/students/me/dashboard");
    return {
      ...response.data,
      student: normalizeStudentProfile(response.data.student),
    };
  },

  /**
   * Track job view
   * POST /api/v1/students/me/jobs/{job_id}/view
   */
  trackJobView: async (
    jobId: string,
    data: TrackJobViewData
  ): Promise<TrackJobViewResponse> => {
    const api = getApiInstance();
    const response = await api.post<TrackJobViewResponse>(
      `/api/v1/students/me/jobs/${jobId}/view`,
      data
    );
    return response.data;
  },

  /**
   * Get student activity
   * GET /api/v1/students/me/activity
   */
  getActivity: async (): Promise<string> => {
    const api = getApiInstance();
    const response = await api.get<string>("/api/v1/students/me/activity");
    return response.data;
  },

  /**
   * Get my profile
   * GET /api/v1/students/me/profile
   */
  getMyProfile: async (): Promise<StudentProfile> => {
    const api = getApiInstance();
    const response = await api.get<StudentProfile>("/api/v1/students/me/profile");
    return normalizeStudentProfile(response.data);
  },

  /**
   * Update my profile
   * PUT /api/v1/students/me/profile
   */
  updateMyProfile: async (data: UpdateProfileData): Promise<StudentProfile> => {
    const api = getApiInstance();
    const payload: UpdateProfileData = { ...data };

    if (!("spoken_languages" in payload) && "languages" in payload) {
      payload.spoken_languages = payload.languages;
    }

    if (!("social_links" in payload)) {
      const socialLinks: NonNullable<UpdateProfileData["social_links"]> = {};

      if ("github_profile" in payload) {
        socialLinks.github_profile = payload.github_profile ?? null;
      }
      if ("linkedin_profile" in payload) {
        socialLinks.linkedin_profile = payload.linkedin_profile ?? null;
      }
      if ("portfolio_url" in payload) {
        socialLinks.portfolio_url = payload.portfolio_url ?? null;
      }
      if ("coding_platforms" in payload) {
        socialLinks.coding_platforms = payload.coding_platforms ?? {};
      }

      if (Object.keys(socialLinks).length > 0) {
        payload.social_links = socialLinks;
      }
    }

    const response = await api.put<StudentProfile>("/api/v1/students/me/profile", payload);
    return normalizeStudentProfile(response.data);
  },

  /**
   * Get profile completeness
   * GET /api/v1/students/me/profile-completeness
   */
  getProfileCompleteness: async (): Promise<ProfileCompletenessResponse> => {
    const api = getApiInstance();
    const response = await api.get<ProfileCompletenessResponse>(
      "/api/v1/students/me/profile-completeness"
    );
    return response.data;
  },

  /**
   * List saved jobs
   * GET /api/v1/students/me/saved-jobs
   */
  getSavedJobs: async (): Promise<SavedJobsResponse> => {
    const api = getApiInstance();
    const response = await api.get<SavedJobsResponse>(
      "/api/v1/students/me/saved-jobs"
    );
    return response.data;
  },

  /**
   * Save job
   * POST /api/v1/students/me/saved-jobs
   */
  saveJob: async (data: SaveJobData): Promise<SavedJob> => {
    const api = getApiInstance();
    const response = await api.post<SavedJob>(
      "/api/v1/students/me/saved-jobs",
      data
    );
    return response.data;
  },

  /**
   * Check if job is saved
   * GET /api/v1/students/me/saved-jobs/check/{job_id}
   */
  checkIfSaved: async (jobId: number): Promise<CheckSavedResponse> => {
    const api = getApiInstance();
    const response = await api.get<CheckSavedResponse>(
      `/api/v1/students/me/saved-jobs/check/${jobId}`
    );
    return response.data;
  },

  /**
   * Get recommended jobs
   * GET /api/v1/students/me/recommended-jobs
   */
  getRecommendedJobs: async (
    limit?: number,
    offset?: number
  ): Promise<RecommendedJobsResponse> => {
    const api = getApiInstance();
    const params = new URLSearchParams();
    if (limit !== undefined) params.append("limit", String(limit));
    if (offset !== undefined) params.append("offset", String(offset));

    const queryString = params.toString();
    const url = `/api/v1/students/me/recommended-jobs${queryString ? `?${queryString}` : ""}`;
    const response = await api.get<RecommendedJobsResponse>(url);
    console.log(response);
    return response.data;
  },

  /**
   * Get similar jobs
   * GET /api/v1/students/me/jobs/{job_id}/similar
   */
  getSimilarJobs: async (jobId: string): Promise<SimilarJobsResponse> => {
    const api = getApiInstance();
    const response = await api.get<SimilarJobsResponse>(
      `/api/v1/students/me/jobs/${jobId}/similar`
    );
    return response.data;
  },

  /**
   * Get recommendation stats
   * GET /api/v1/students/me/recommendation-stats
   */
  getRecommendationStats: async (): Promise<RecommendationStatsResponse> => {
    const api = getApiInstance();
    const response = await api.get<RecommendationStatsResponse>(
      "/api/v1/students/me/recommendation-stats"
    );
    return response.data;
  },

  /**
   * Upload resume (PDF only, max 5MB)
   * POST /api/v1/students/me/resume
   */
  uploadResume: async (file: File): Promise<{ message: string; resume_url: string }> => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error("Only PDF files are allowed");
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB");
    }

    const api = getApiInstance();
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ message: string; resume_url: string }>(
      "/api/v1/students/me/resume",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Delete resume
   * DELETE /api/v1/students/me/resume
   */
  deleteResume: async (): Promise<{ message: string }> => {
    const api = getApiInstance();
    const response = await api.delete<{ message: string }>(
      "/api/v1/students/me/resume"
    );
    return response.data;
  },
};

/**
 * Excel Student Import API
 */
export interface ExcelStudentImportData {
  name: string;
  email: string;
  phone?: string;
  campus?: string;
  school?: string;
  status?: string;
  resume?: string;
  projects?: string;
  metadata?: Record<string, any>;
}

export interface BulkExcelImportRequest {
  students: ExcelStudentImportData[];
}

export interface BulkExcelImportResponse {
  success: number;
  failed: number;
  total: number;
  created_users: number;
  created_students: number;
  skipped: number;
  errors: Array<{
    index?: number;
    email?: string;
    name?: string;
    error: string;
  }>;
}

export const excelImportApi = {
  /**
   * Import students from Excel data
   * POST /api/v1/admin/students/import-excel
   */
  importStudents: async (
    data: BulkExcelImportRequest
  ): Promise<BulkExcelImportResponse> => {
    const api = getApiInstance();
    const response = await api.post<BulkExcelImportResponse>(
      "/api/v1/admin/students/import-excel",
      data
    );
    return response.data;
  },
};

