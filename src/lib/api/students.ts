import axios from "axios";
import { Job } from "@/types/job";
import { StudentProfile } from "@/types/student";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

// Create axios instance with auth token
const getApiInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add auth token to requests
  instance.interceptors.request.use(
    (config) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Handle 401 errors - token expired or invalid
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Clear invalid token and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user_info");
          // Only redirect if we're not already on login/signup page
          if (!window.location.pathname.includes("/login") && 
              !window.location.pathname.includes("/signup")) {
            window.location.href = "/login";
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Dashboard stats structure (can be extended based on actual API response)
export interface DashboardStats {
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
  job_id: number;
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

// Update profile request
export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  degree?: string;
  branch?: string;
  passing_year?: number;
  cgpa?: number;
  college_id?: number;
  resume_url?: string;
}

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
    return response.data;
  },

  /**
   * Track job view
   * POST /api/v1/students/me/jobs/{job_id}/view
   */
  trackJobView: async (
    jobId: number,
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
   * GET /api/v1/students/me
   * Uses dummy API if real API fails
   */
  getMyProfile: async (): Promise<StudentProfile> => {
    // Try real API first
    try {
      const api = getApiInstance();
      const response = await api.get<StudentProfile>("/api/v1/students/me");
      return response.data;
    } catch (error: any) {
      // If API fails (401, 404, etc.), use dummy API
      console.log("Real API failed, using dummy API:", error.message);
      const { getDummyProfile, initDummyProfile } = await import("./students-dummy");
      const profile = getDummyProfile() || initDummyProfile();
      return profile;
    }
  },

  /**
   * Update my profile
   * PUT /api/v1/students/me
   * Uses dummy API if real API fails
   */
  updateMyProfile: async (data: UpdateProfileData): Promise<StudentProfile> => {
    // Try real API first
    try {
      const api = getApiInstance();
      const response = await api.put<StudentProfile>("/api/v1/students/me", data);
      // Also save to dummy API for consistency
      const { saveDummyProfile } = await import("./students-dummy");
      saveDummyProfile(data);
      return response.data;
    } catch (error: any) {
      // If API fails, use dummy API
      console.log("Real API failed, using dummy API:", error.message);
      const { saveDummyProfile } = await import("./students-dummy");
      const profile = saveDummyProfile(data);
      return profile;
    }
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
    return response.data;
  },

  /**
   * Get similar jobs
   * GET /api/v1/students/me/jobs/{job_id}/similar
   */
  getSimilarJobs: async (jobId: number): Promise<SimilarJobsResponse> => {
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
};

