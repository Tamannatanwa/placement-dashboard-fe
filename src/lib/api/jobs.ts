import { getApiInstance } from "./axios-instance";
import { Job, JobsResponse, JobFilters } from "@/types/job";

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





