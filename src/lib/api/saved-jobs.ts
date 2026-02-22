import { getApiInstance } from "./axios-instance";
import { Job } from "@/types/job";

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  job: Job | null;
  folder: string | null;
  notes: string | null;
  saved_at: string;
  created_at: string;
  updated_at: string | null;
}

export interface SavedJobsResponse {
  total: number;
  saved_jobs: SavedJob[];
  folders: string[];
}

export interface SavedJobCreate {
  job_id: string;
  folder?: string | null;
  notes?: string | null;
}

export interface SavedJobUpdate {
  folder?: string | null;
  notes?: string | null;
}

export interface FolderResponse {
  name: string;
  count: number;
}

export interface CheckSavedResponse {
  job_id: string;
  is_saved: boolean;
  saved_job_id: string | null;
  folder: string | null;
}

/**
 * Saved Jobs API
 * CRUD operations for saved/bookmarked jobs
 */
export const savedJobsApi = {
  /**
   * Save/bookmark a job
   */
  saveJob: async (data: SavedJobCreate): Promise<SavedJob> => {
    const api = getApiInstance();
    const response = await api.post<SavedJob>(
      "/api/v1/students/me/saved-jobs",
      data
    );
    return response.data;
  },

  /**
   * Get all saved jobs
   */
  getSavedJobs: async (folder?: string): Promise<SavedJobsResponse> => {
    const api = getApiInstance();
    const params = new URLSearchParams();
    if (folder) {
      params.append("folder", folder);
    }
    const response = await api.get<SavedJobsResponse>(
      `/api/v1/students/me/saved-jobs?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Update a saved job (folder or notes)
   */
  updateSavedJob: async (
    savedJobId: string,
    data: SavedJobUpdate
  ): Promise<SavedJob> => {
    const api = getApiInstance();
    const response = await api.patch<SavedJob>(
      `/api/v1/students/me/saved-jobs/${savedJobId}`,
      data
    );
    return response.data;
  },

  /**
   * Remove a saved job
   */
  removeSavedJob: async (savedJobId: string): Promise<void> => {
    const api = getApiInstance();
    await api.delete(`/api/v1/students/me/saved-jobs/${savedJobId}`);
  },

  /**
   * Get all folders with job counts
   */
  getFolders: async (): Promise<FolderResponse[]> => {
    const api = getApiInstance();
    const response = await api.get<FolderResponse[]>(
      "/api/v1/students/me/saved-jobs/folders"
    );
    return response.data;
  },

  /**
   * Check if a job is already saved
   */
  checkIfSaved: async (jobId: string): Promise<CheckSavedResponse> => {
    const api = getApiInstance();
    const response = await api.get<CheckSavedResponse>(
      `/api/v1/students/me/saved-jobs/check/${jobId}`
    );
    return response.data;
  },
};





