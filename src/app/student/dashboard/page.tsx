"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserInfo } from "@/lib/utils/auth";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { JobStats } from "@/components/jobs/JobStats";
import { JobSearch } from "@/components/jobs/JobSearch";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobCard } from "@/components/jobs/JobCard";
import { jobsApi } from "@/lib/api/jobs";
import { studentsApi } from "@/lib/api/students";
import { savedJobsApi } from "@/lib/api/saved-jobs";
import { Job, JobFilters as JobFiltersType } from "@/types/job";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Student Dashboard Page
 * Shows job listings with search, filters, and statistics
 */
export default function StudentDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [filters, setFilters] = useState<JobFiltersType>({
    page: 1,
    size: 20,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);
  const [totalJobs, setTotalJobs] = useState(0);
  const [newThisWeek, setNewThisWeek] = useState(0);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [profileCompleteness, setProfileCompleteness] = useState<number | undefined>(undefined);
  const [recommendationsAvailable, setRecommendationsAvailable] = useState(0);
  const [notificationsUnread, setNotificationsUnread] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboard();
    loadSavedJobs();
    loadRecommendedJobs();
  }, []);

  // Load jobs when filters change
  useEffect(() => {
    loadJobs();
  }, [filters]);

  // Calculate new jobs this week
  useEffect(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newJobs = jobs.filter(
      (job) => new Date(job.created_at) >= weekAgo
    ).length;
    setNewThisWeek(newJobs);
  }, [jobs]);

  // Load dashboard data from API
  const loadDashboard = async () => {
    setIsDashboardLoading(true);
    try {
      const dashboardData = await studentsApi.getDashboard();
      
      // Set dashboard stats
      setRecentJobs(dashboardData.recent_jobs || []);
      setSavedJobsCount(dashboardData.saved_jobs_count || 0);
      
      // Get profile completeness from dashboard or student profile, with fallback
      const completeness = 
        dashboardData.profile_completeness ?? 
        dashboardData.student?.profile_completeness ?? 
        undefined;
      setProfileCompleteness(completeness);
      
      setNotificationsUnread(dashboardData.notifications_unread || 0);
      setRecommendationsAvailable(dashboardData.recommendations_available || 0);
      
      // Update saved jobs set from API count
      if (dashboardData.student?.saved_jobs_count) {
        setSavedJobsCount(dashboardData.student.saved_jobs_count);
      }
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      // Try to load profile completeness from profile API as fallback
      try {
        const profile = await studentsApi.getMyProfile();
        if (profile.profile_completeness !== undefined) {
          setProfileCompleteness(profile.profile_completeness);
        }
      } catch (profileError) {
        console.error("Error loading profile completeness:", profileError);
      }
      // Don't show error toast for dashboard - it's not critical if it fails
    } finally {
      setIsDashboardLoading(false);
    }
  };

  // Load saved jobs from API
  const loadSavedJobs = async () => {
    try {
      const response = await savedJobsApi.getSavedJobs();
      const savedJobIds = new Set(response.saved_jobs.map((sj) => String(sj.job_id)));
      setSavedJobs(savedJobIds);
      setSavedJobsCount(response.total);
    } catch (error: any) {
      console.error("Error loading saved jobs:", error);
      // Silently fail - saved jobs can be loaded later
    }
  };

  // Load recommended jobs from API
  const loadRecommendedJobs = async () => {
    setIsLoadingRecommended(true);
    try {
      const response = await studentsApi.getRecommendedJobs(10, 0);
      const jobs = response.recommendations.map((rec) => rec.job);
      setRecommendedJobs(jobs);
      setRecommendationsAvailable(response.total);
    } catch (error: any) {
      console.error("Error loading recommended jobs:", error);
      // Silently fail - recommendations are optional
    } finally {
      setIsLoadingRecommended(false);
    }
  };

  // Load jobs from API
  const loadJobs = async () => {
    const currentPage = filters.page || 1;
    const isFirstPage = currentPage === 1;

    if (isFirstPage) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await jobsApi.getJobs(filters);

      setJobs((prevJobs) => {
        if (isFirstPage) {
          return response.items;
        }

        const existingIds = new Set(prevJobs.map((job) => job.id));
        const newItems = response.items.filter((job) => !existingIds.has(job.id));
        return [...prevJobs, ...newItems];
      });

      setTotalJobs(response.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load jobs");
      console.error("Error loading jobs:", error);
    } finally {
      if (isFirstPage) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  // Handle search - filter by title / company / skills on the client side only.
  // We avoid mapping this text directly to backend `skills` filter,
  // since that expects exact skill tokens and can hide many relevant jobs.
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle job application with view tracking
  const handleApply = async (jobId: string) => {
    try {
      // Track job view before navigating
      const jobIdNum = parseInt(jobId, 10);
      if (!isNaN(jobIdNum)) {
        await studentsApi.trackJobView(jobIdNum, {
          job_id: jobIdNum,
          duration_seconds: 0, // We'll track duration on the detail page
          source: "dashboard",
        });
      }
    } catch (error) {
      // Silently fail - view tracking is not critical
      console.error("Error tracking job view:", error);
    }
    
    // Navigate to job detail or application page
    router.push(`/jobs/${jobId}`);
  };

  // Handle save job using API
  const handleSave = async (jobId: string) => {
    try {
      const isCurrentlySaved = savedJobs.has(jobId);
      
      if (isCurrentlySaved) {
        // Check if saved to get the saved job ID, then we'd need a delete endpoint
        // For now, we'll just show a message that unsaving requires the delete endpoint
        toast.info("To unsave, please use the saved jobs page");
        return;
      }

      // Save job via API
      await savedJobsApi.saveJob({
        job_id: jobId,
      });

      // Update local state
      setSavedJobs((prev) => {
        const newSet = new Set(prev);
        newSet.add(jobId);
        return newSet;
      });
      setSavedJobsCount((prev) => prev + 1);
      toast.success("Job saved successfully");
    } catch (error: any) {
      console.error("Error saving job:", error);
      toast.error(error.response?.data?.detail || error.response?.data?.message || "Failed to save job");
    }
  };

  // Filter jobs by search query (client-side for now)
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills_required?.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [jobs, searchQuery]);

  const hasMoreJobs = jobs.length < totalJobs;

  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll: load next page when the sentinel div becomes visible
  useEffect(() => {
    if (!hasMoreJobs) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (
          firstEntry.isIntersecting &&
          !isLoading &&
          !isLoadingMore &&
          (filters.page || 1) * (filters.size || 20) < totalJobs
        ) {
          setFilters((prev) => ({
            ...prev,
            page: (prev.page || 1) + 1,
          }));
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    const current = loadMoreTriggerRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
      observer.disconnect();
    };
  }, [hasMoreJobs, isLoading, isLoadingMore, filters.page, filters.size, totalJobs, setFilters]);

  return (
    <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover your next career opportunity
          </p>
        </div>

        {/* Profile Completeness Alert */}
        {!isDashboardLoading && profileCompleteness !== undefined && (
          <Card className={profileCompleteness === 100 ? "border-green-500/20 bg-green-500/5" : "border-cyan-500/20 bg-cyan-500/5"}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {profileCompleteness === 100 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  )}
                  <CardTitle className="text-base">Profile Strength</CardTitle>
                </div>
                <span className="text-sm font-medium">{profileCompleteness}%</span>
              </div>
              <CardDescription>
                {profileCompleteness === 100
                  ? "Congratulations! Your profile is complete."
                  : profileCompleteness >= 85
                  ? "Your profile is looking great! Add skills to reach 100%"
                  : "Complete your profile to get better job recommendations"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={profileCompleteness} className="h-2 mb-4" />
              <Button
                onClick={() => router.push("/profile/wizard")}
                className={profileCompleteness === 100 
                  ? "w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
                  : "w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
                }
              >
                {profileCompleteness === 100 ? "Update Profile" : "Complete Profile"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <JobStats
          availableJobs={totalJobs}
          newThisWeek={newThisWeek}
          applied={0} // TODO: Get from applications API
          saved={savedJobsCount}
        />

        {/* Search Bar */}
        <div className="max-w-2xl">
          <JobSearch
            onSearch={handleSearch}
            placeholder="Search jobs by title, company, or skills..."
          />
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-lg p-6">
          <JobFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClear={() => {
              setFilters({
                page: 1,
                size: 20,
                sort_by: "created_at",
                sort_order: "desc",
              });
            }}
          />
        </div>

        {/* Recommended Jobs Section */}
        {recommendedJobs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Recommended for You</h2>
                <p className="text-sm text-muted-foreground">
                  Jobs matched to your profile
                </p>
              </div>
            </div>
            {isLoadingRecommended ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading recommendations...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendedJobs.slice(0, 4).map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={handleApply}
                    onSave={handleSave}
                    isSaved={savedJobs.has(job.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Jobs Section */}
        {recentJobs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Recent Jobs</h2>
                <p className="text-sm text-muted-foreground">
                  Jobs you might be interested in
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentJobs.slice(0, 4).map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleApply}
                  onSave={handleSave}
                  isSaved={savedJobs.has(job.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Jobs Section */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {filteredJobs.length} Jobs Found
          </h2>
          <Select
            value={filters.sort_by || "created_at"}
            onValueChange={(value: "created_at" | "title" | "location" | "view_count") => {
              setFilters({ ...filters, sort_by: value });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Latest</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="location">Location</SelectItem>
              <SelectItem value="view_count">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Listings with infinite scroll */}
        {isLoading && filters.page === 1 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Loading jobs...</div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">No jobs found. Try adjusting your filters.</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleApply}
                  onSave={handleSave}
                  isSaved={savedJobs.has(job.id)}
                />
              ))}
            </div>
            {hasMoreJobs && (
              <div
                ref={loadMoreTriggerRef}
                className="flex items-center justify-center py-6 text-sm text-muted-foreground"
              >
                {isLoadingMore ? "Loading more jobs..." : "Scroll to load more jobs"}
              </div>
            )}
          </>
        )}
    </div>
  );
}

