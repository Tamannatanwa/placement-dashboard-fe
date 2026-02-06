import { getApiInstance } from "./axios-instance";

/**
 * Student Review Data - Request/Response Types
 */
export interface StudentReviewUpdateData {
  group?: string;
  feedback?: string;
  resume_score?: number; // 0-10
  resume_structure?: string;
  resume_projects?: string;
  project_score?: number; // 0-10
  project_difficulty?: "easy" | "medium" | "hard";
  project_review?: string;
  status?:
    | "placed"
    | "unplaced"
    | "internship_unpaid"
    | "internship_paid"
    | "job_ready"
    | "job_ready_under_process"
    | "long_leave"
    | "dropout";
}

export interface StudentReviewResponse {
  success: boolean;
  message?: string;
  data: {
    student_id: string;
    group?: string;
    feedback?: string;
    resume_score?: number;
    resume_structure?: string;
    resume_projects?: string;
    project_score?: number;
    project_difficulty?: "easy" | "medium" | "hard";
    project_review?: string;
    status?: string;
    updated_at?: string;
    updated_by?: string;
  };
}

export interface BulkReviewUpdateData {
  students: Array<{
    student_id: string;
  } & StudentReviewUpdateData>;
}

export interface BulkReviewResponse {
  success: boolean;
  message?: string;
  data: {
    total: number;
    updated: number;
    failed: number;
    results: Array<{
      student_id: string;
      success: boolean;
      message?: string;
    }>;
  };
}

export interface StudentReviewListResponse {
  success: boolean;
  data: {
    total: number;
    limit: number;
    offset: number;
    students: Array<{
      student_id: string;
      name: string;
      email: string;
      status: string;
      group?: string;
      resume_score?: number;
      project_score?: number;
      has_feedback: boolean;
      updated_at: string;
    }>;
  };
}

/**
 * Student Review API
 */
export const studentReviewApi = {
  /**
   * Update student review data
   * PUT /api/v1/admin/students/{student_id}/review
   */
  updateReview: async (
    studentId: string | number,
    data: StudentReviewUpdateData
  ): Promise<StudentReviewResponse> => {
    const api = getApiInstance();
    const response = await api.put<StudentReviewResponse>(
      `/api/v1/admin/students/${studentId}/review`,
      data
    );
    return response.data;
  },

  /**
   * Get student review data
   * GET /api/v1/admin/students/{student_id}/review
   */
  getReview: async (
    studentId: string | number
  ): Promise<StudentReviewResponse> => {
    const api = getApiInstance();
    const response = await api.get<StudentReviewResponse>(
      `/api/v1/admin/students/${studentId}/review`
    );
    return response.data;
  },

  /**
   * Bulk update student reviews
   * PUT /api/v1/admin/students/bulk-review
   */
  bulkUpdateReviews: async (
    data: BulkReviewUpdateData
  ): Promise<BulkReviewResponse> => {
    const api = getApiInstance();
    const response = await api.put<BulkReviewResponse>(
      `/api/v1/admin/students/bulk-review`,
      data
    );
    return response.data;
  },

  /**
   * List students with reviews (optional)
   * GET /api/v1/admin/students/reviews
   */
  listReviews: async (params?: {
    status?: string;
    school?: string;
    group?: string;
    has_review?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<StudentReviewListResponse> => {
    const api = getApiInstance();
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.school) queryParams.append("school", params.school);
    if (params?.group) queryParams.append("group", params.group);
    if (params?.has_review !== undefined)
      queryParams.append("has_review", String(params.has_review));
    if (params?.limit !== undefined)
      queryParams.append("limit", String(params.limit));
    if (params?.offset !== undefined)
      queryParams.append("offset", String(params.offset));

    const queryString = queryParams.toString();
    const url = `/api/v1/admin/students/reviews${
      queryString ? `?${queryString}` : ""
    }`;
    const response = await api.get<StudentReviewListResponse>(url);
    return response.data;
  },
};


