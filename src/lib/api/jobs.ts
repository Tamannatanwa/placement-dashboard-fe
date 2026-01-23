import axios from "axios";
import { Job, JobsResponse, JobFilters } from "@/types/job";

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

/**
 * Get paginated list of jobs with filters
 */
export const jobsApi = {
  getJobs: async (filters?: JobFilters): Promise<JobsResponse> => {
    const api = getApiInstance();
    const params = new URLSearchParams();

    // Add filters to query params
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<JobsResponse>(`/api/v1/jobs/?${params.toString()}`);
    return response.data;
  },

  getJob: async (jobId: string): Promise<Job> => {
    const api = getApiInstance();
    const response = await api.get<Job>(`/api/v1/jobs/${jobId}`);
    return response.data;
  },
};


