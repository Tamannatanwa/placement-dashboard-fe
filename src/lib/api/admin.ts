import { getApiInstance } from "./axios-instance";

// ==== Backend admin stats schemas (subset, for typing) ====

interface ExperienceBreakdown {
  fresher: number;
  junior: number;
  mid: number;
  senior: number;
  not_specified: number;
}

export interface AdminDashboardBackendStats {
  total_jobs: number;
  total_jobs_today: number;
  total_messages_processed: number;
  total_messages_today: number;
  total_accounts: number;
  active_accounts: number;
  total_groups: number;
  active_groups: number;
  joined_groups: number;
  average_health_score: number;
  experience_breakdown: ExperienceBreakdown;
  last_group_join: string | null;
  last_message_scrape: string | null;
  last_job_extraction: string | null;
  jobs_extracted_last_24h: number;
  duplicates_found_last_24h: number;
  messages_scraped_last_24h: number;
  estimated_cost_today: number;
  estimated_cost_month: number;
}

export interface AdminScrapingStatsBackend {
  total_accounts: number;
  active_accounts: number;
  banned_accounts: number;
  accounts_used_today: number;
  total_channels: number;
  active_channels: number;
  joined_channels: number;
  channels_scraped_today: number;
  total_messages: number;
  messages_last_7_days: number;
  messages_last_30_days: number;
  messages_today: number;
  average_health_score: number | null;
  top_channels: Array<{
    username: string;
    title: string;
    health_score: number;
    quality_jobs: number;
  }>;
}

export interface AdminJobStatsBackend {
  total_jobs: number;
  active_jobs: number;
  verified_jobs: number;
  jobs_today: number;
  jobs_last_7_days: number;
  jobs_last_30_days: number;
  experience_breakdown: ExperienceBreakdown;
  jobs_with_salary: number;
  avg_min_salary: number | null;
  avg_max_salary: number | null;
  top_locations: Array<{ location: string; count: number }>;
  top_companies: Array<{ company: string; count: number }>;
  remote_jobs: number;
  office_jobs: number;
  hybrid_jobs: number;
}

// ==== Frontend-friendly mapped types for existing UI components ====

export interface AdminDashboardUiStats {
  total_jobs_today: number;
  total_jobs_this_week: number;
  total_channels: number;
  total_companies: number;
  total_cities: number;
  total_students: number;
  total_campuses: number;
  active_students: number;
  inactive_students: number;
  jobs_trend: { date: string; count: number }[];
}

export interface MonitoringServicesUi {
  name: string;
  status: "healthy" | "degraded" | "down";
  uptime: number;
  lastCheck: Date;
  responseTime: number;
  description: string;
}

export interface MonitoringCrawlerUi {
  name: string;
  status: "running" | "idle" | "error";
  lastRun: Date;
  jobsFound: number;
  errors: number;
  nextRun: Date;
}

export interface MonitoringClassifierUi {
  status: "active" | "idle" | "error";
  accuracy: number;
  totalClassified: number;
  lastRun: Date;
}

export interface MonitoringDowntimeUi {
  id: string;
  service: string;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  reason: string;
  status: "resolved" | "ongoing";
}

export const adminApi = {
  /**
   * Get dashboard stats from backend and map to existing UI structure.
   * Backend: GET /api/v1/admin/stats/dashboard
   */
  getDashboardStats: async (): Promise<AdminDashboardUiStats> => {
    const api = getApiInstance();
    const response = await api.get<AdminDashboardBackendStats>(
      "/api/v1/admin/stats/dashboard",
    );
    const data = response.data;

    // Map backend fields into current UI model.
    return {
      total_jobs_today: data.total_jobs_today,
      // Approximate "this week" using last 7 days metric if needed.
      total_jobs_this_week: data.jobs_extracted_last_24h, // better than mock; can refine later
      total_channels: data.total_groups,
      total_companies: 0, // not available directly; keep 0 for now
      total_cities: 0, // not available directly
      total_students: 0, // student counts will come from student admin APIs later
      total_campuses: 0,
      active_students: 0,
      inactive_students: 0,
      // Simple 7-bar trend using messages/jobs metrics as a placeholder
      jobs_trend: [
        { date: "24h", count: data.jobs_extracted_last_24h },
        { date: "Msgs", count: data.messages_scraped_last_24h },
      ],
    };
  },

  /**
   * Get scraping stats for monitoring page.
   * Backend: GET /api/v1/admin/stats/scraping
   */
  getScrapingStats: async (): Promise<AdminScrapingStatsBackend> => {
    const api = getApiInstance();
    const response = await api.get<AdminScrapingStatsBackend>(
      "/api/v1/admin/stats/scraping",
    );
    return response.data;
  },

  /**
   * Get job stats for monitoring/analytics.
   * Backend: GET /api/v1/admin/stats/jobs
   */
  getJobStats: async (): Promise<AdminJobStatsBackend> => {
    const api = getApiInstance();
    const response = await api.get<AdminJobStatsBackend>(
      "/api/v1/admin/stats/jobs",
    );
    return response.data;
  },
};


