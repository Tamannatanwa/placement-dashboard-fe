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
  instance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

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
   * GET /api/v1/students/me/students/me/activity
   */
  getActivity: async (): Promise<string> => {
    const api = getApiInstance();
    const response = await api.get<string>("/api/v1/students/me/students/me/activity");
    return response.data;
  },
};

